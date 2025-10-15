import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface Linea {
  producto_id: string | null;
  descripcion: string;
  cantidad: number;
}

interface Pallet {
  id: number;
  sellto_customer_name: string;
  furniture_load_date_jmt: string | null;
  jmt_status: string;
  jmteventname: string;
  lineas: Linea[];
}

export default function PalletDetail() {
  const { id } = useParams<{ id: string }>();
  const [pallet, setPallet] = useState<Pallet | null>(null);
  const [loading, setLoading] = useState(true);
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
    </div>
  );
}
