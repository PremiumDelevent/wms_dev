import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

// =======================
// Types
// =======================
import type { Pallet } from "./types/Pallet";
import type { Linea } from "./types/Linea";

interface LineaItemProps {
  linea: Linea;
  index: number;
  cantidad: number;
  setCantidad: (idx: number, valor: number) => void;
  checked: boolean;
  toggleCheck: (idx: number) => void;
}

const LineaItem = ({ linea, index, cantidad, setCantidad, checked, toggleCheck }: LineaItemProps) => {
  return (
    <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={() => toggleCheck(index)} 
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px" }}>{linea.producto_id ?? "SIN_ID"} — {linea.descripcion}</div>
        <div style={{ fontSize: "12px", color: "#666" }}>Cantidad: {linea.cantidad}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          disabled={cantidad <= 0}
          onClick={() => setCantidad(index, Math.max(cantidad - 1, 0))}
          style={{ padding: "4px 8px", cursor: "pointer", backgroundColor: "#db0f0f", color: "#fff", border: "none", borderRadius: "4px" }}
        >
          -
        </button>
        <div style={{ minWidth: "28px", textAlign: "center" }}>{cantidad}</div>
        <button
          disabled={cantidad >= linea.cantidad}
          onClick={() => setCantidad(index, cantidad + 1)}
          style={{ padding: "4px 8px", cursor: "pointer", backgroundColor: "#10c765", color: "#fff", border: "none", borderRadius: "4px" }}
        >
          +
        </button>
      </div>
    </li>
  );
};

interface PreparadoPopupProps {
  pallet: Pallet;
  onClose: () => void;
  onConfirm: (lineasVerificadas: Linea[], cantidades: number[]) => void;
}

function PreparadoPopup({ pallet, onClose, onConfirm }: PreparadoPopupProps) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [cantidades, setCantidades] = useState<number[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);

  useEffect(() => {
    if (pallet) {
      setCantidades(pallet.lineas.map(l => l.cantidad));
      setSelected(pallet.lineas.map(() => false));
    }
  }, [pallet]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleSetCantidad = useCallback((idx: number, valor: number) => {
    setCantidades(prev => {
      const copy = [...prev];
      copy[idx] = valor;
      return copy;
    });
  }, []);

  const handleToggleCheck = useCallback((idx: number) => {
    setSelected(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  }, []);

  const handleMarcarPreparado = useCallback(() => {
    const lineasSeleccionadas = pallet.lineas.filter((_, i) => selected[i]);
    const cantidadesSeleccionadas = cantidades.filter((_, i) => selected[i]);

    if (lineasSeleccionadas.length === 0) {
      setIsError(true);
      setMensaje("⚠️ Marca al menos una línea para verificar");
      return;
    }

    onConfirm(lineasSeleccionadas, cantidadesSeleccionadas);
    setIsError(false);
    setMensaje("✅ Pallet marcado como preparado");
    
    setTimeout(() => onClose(), 800);
  }, [pallet, selected, cantidades, onConfirm, onClose]);

  return (
    <div 
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", 
        alignItems: "center", zIndex: 2000, padding: "20px"
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: "720px", maxHeight: "85vh", overflowY: "auto", background: "#fff",
          borderRadius: "8px", padding: "18px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", 
          color: "black"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Verificar Pallet #{pallet.id}</h2>
        <div style={{ marginBottom: "8px" }}>
          <strong>Cliente:</strong> {pallet.sellto_customer_name} &nbsp;|&nbsp;
          <strong>Evento:</strong> {pallet.jmteventname} &nbsp;|&nbsp;
          <strong>Fecha carga:</strong> {pallet.furniture_load_date_jmt ? new Date(pallet.furniture_load_date_jmt).toLocaleString() : "-"}
        </div>

        <h3>Verificar artículos preparados</h3>
        {pallet.lineas.length === 0 ? (
          <em>Sin artículos</em>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {pallet.lineas.map((linea, i) => (
              <LineaItem
                key={`${pallet.id}-${i}`}
                linea={linea}
                index={i}
                cantidad={cantidades[i] ?? linea.cantidad}
                setCantidad={handleSetCantidad}
                checked={selected[i] ?? false}
                toggleCheck={handleToggleCheck}
              />
            ))}
          </ul>
        )}

        {mensaje && (
          <p style={{ 
            color: isError ? "red" : "green", 
            fontWeight: "bold",
            padding: "8px",
            background: isError ? "#fee" : "#efe",
            borderRadius: "4px"
          }}>
            {mensaje}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button
            onClick={handleMarcarPreparado}
            style={{
              padding: "8px 14px",
              background: "#10c765",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ✅ Pallet preparado
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "8px 14px",
              background: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PalletDetail() {
  const { id } = useParams<{ id: string }>();
  const [pallet, setPallet] = useState<Pallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPallet = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/api/pallets-db/${id}`);
        if (!res.ok) throw new Error("Error al cargar pallet");
        const data: Pallet = await res.json();
        setPallet(data);
      } catch (err) {
        console.error("❌ Error cargando pallet:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPallet();
  }, [id]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/pallets-db/${id}/pdf`);
      if (!res.ok) throw new Error("Error al generar PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `pallet_${id}.pdf`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Error descargando PDF:", err);
    }
  };

  const handleMarcarPreparado = async (lineasVerificadas: Linea[], cantidades: number[]) => {
    try {
      // Preparar el body para decrease-stock
      const productos = lineasVerificadas.map((linea, i) => ({
        producto_id: linea.producto_id,
        cantidad: cantidades[i]
      }));

      // Llamar a la API de decrease-stock
      const res = await fetch(`http://localhost:4000/api/decrease-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productos }),
      });

      if (!res.ok) throw new Error("Error al decrementar el stock");

      const result = await res.json();

      setIsError(false);
      setMensaje(`✅ ${result.message || "Stock actualizado correctamente"}`);

      // Recargar el pallet para ver los cambios
      const updatedRes = await fetch(`http://localhost:4000/api/pallets-db/${id}`);
      if (updatedRes.ok) {
        const data: Pallet = await updatedRes.json();
        setPallet(data);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setIsError(true);
      setMensaje("❌ Error al decrementar el stock");
    }
  };

  if (loading) return <p style={{ padding: 18 }}>Cargando pallet...</p>;
  if (!pallet) return <p style={{ padding: 18 }}>❌ Pallet no encontrado</p>;

  return (
    <div style={{ padding: 18 }}>
      <button
        onClick={() => navigate("/pallets")}
        style={{
          padding: "8px 12px",
          background: "#374151",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        ← Volver a Pallets
      </button>

      <button
        onClick={handleDownloadPDF}
        style={{
          padding: "8px 12px",
          background: "#06b6d4",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "12px",
          marginLeft: "8px",
        }}
      >
        📄 Descargar PDF
      </button>

      <button
        onClick={() => setShowPopup(true)}
        style={{
          padding: "8px 12px",
          background: "#10c765",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "12px",
          marginLeft: "8px",
          fontWeight: "bold"
        }}
      >
        ✅ Pallet Preparado
      </button>

      {mensaje && (
        <div style={{ 
          padding: "12px", 
          marginBottom: "16px",
          background: isError ? "#fee" : "#efe",
          color: isError ? "#c00" : "#070",
          borderRadius: "6px",
          fontWeight: "bold"
        }}>
          {mensaje}
        </div>
      )}

      <h1>Pallet #{pallet.id}</h1>
      <p><strong>Cliente:</strong> {pallet.sellto_customer_name}</p>
      <p><strong>Evento:</strong> {pallet.jmteventname}</p>
      <p>
        <strong>Fecha de carga:</strong>{" "}
        {pallet.furniture_load_date_jmt
          ? new Date(pallet.furniture_load_date_jmt).toLocaleString()
          : "-"}
      </p>
      <p><strong>Estado:</strong> {pallet.jmt_status}</p>

      <h2 style={{ marginTop: 24 }}>Líneas</h2>
      {pallet.lineas.length === 0 ? (
        <p>Este pallet no tiene líneas</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "8px" }}>ID Producto</th>
              <th style={{ padding: "8px" }}>Descripción</th>
              <th style={{ padding: "8px" }}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {pallet.lineas.map((linea, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px" }}>{linea.producto_id}</td>
                <td style={{ padding: "8px" }}>{linea.descripcion}</td>
                <td style={{ padding: "8px" }}>{linea.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showPopup && pallet && (
        <PreparadoPopup
          pallet={pallet}
          onClose={() => setShowPopup(false)}
          onConfirm={handleMarcarPreparado}
        />
      )}
    </div>
  );
}