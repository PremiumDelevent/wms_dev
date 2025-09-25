import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =======================
// Interfaces
// =======================
interface Linea {
  producto_id: string | null;
  descripcion: string;
  cantidad: number;
}

interface Pedido {
  id: number;
  num: string;
  sellto_customer_name: string;
  furniture_load_date_jmt: string | null;
  jmt_status: string;
  jmteventname: string;
  lineas: Linea[];
}

interface PedidoPopupProps {
  pedido: Pedido | null;
  titulo: string;
  tipoAccion: "ship" | "return";
  onClose: () => void;
}

interface LineaItemProps {
  linea: Linea;
  cantidad: number;
  setCantidad: (n: number) => void;
}

// =======================
// Componentes
// =======================
const LineaItem = ({ linea, cantidad, setCantidad }: LineaItemProps) => (
  <li style={{ marginBottom: "6px" }}>
    {linea.producto_id ?? "SIN_ID"} - {linea.descripcion} (x{cantidad})
    <button
      onClick={() => setCantidad(Math.max(cantidad - 1, 0))}
      style={{
        marginLeft: "10px",
        padding: "2px 6px",
        fontSize: "12px",
        cursor: "pointer",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "3px",
      }}
    >
      -
    </button>
    <button
      onClick={() => setCantidad(cantidad + 1)}
      style={{
        marginLeft: "4px",
        padding: "2px 6px",
        fontSize: "12px",
        cursor: "pointer",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "3px",
      }}
    >
      +
    </button>
  </li>
);

function PedidoPopup({ pedido, titulo, tipoAccion, onClose }: PedidoPopupProps) {
  // ✅ hooks siempre al inicio
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [cantidades, setCantidades] = useState<number[]>(pedido?.lineas.map(l => l.cantidad) || []);

  if (!pedido) return null;

  const actualizarStock = async () => {
    try {
      const endpoint = tipoAccion === "ship"
        ? "http://localhost:4000/api/ship-order"
        : "http://localhost:4000/api/return-order";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId: pedido.id,
          productos: pedido.lineas.map((linea, i) => ({
            producto_id: linea.producto_id,
            descripcion: linea.descripcion,
            cantidad: cantidades[i],
          })),
        }),
      });

      const data = await res.json().catch(() => null);
      setIsError(!res.ok);
      setMensaje(data?.message || (res.ok ? "✅ Stock actualizado correctamente" : "❌ Error actualizando stock"));
    } catch (err) {
      console.error("❌ Error actualizando stock:", err);
      setIsError(true);
      setMensaje("❌ Error actualizando stock");
    }
  };

 const actualizarStatus = async () => {
  try {
    const endpoint =
      tipoAccion === "ship"
        ? "http://localhost:4000/api/ship-status"
        : "http://localhost:4000/api/return-status";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId: pedido.id }), // ⬅️ directo
    });

    const data = await res.json().catch(() => null);
    setIsError(!res.ok);
    setMensaje(
      data?.message ||
        (res.ok
          ? "✅ Estado actualizado correctamente"
          : "❌ Error actualizando estado")
    );
  } catch (err) {
    console.error("❌ Error actualizando estado:", err);
    setIsError(true);
    setMensaje("❌ Error actualizando estado");
  }
};

const registrarIncidencia = async () => {
  try {
    const res = await fetch("http://localhost:4000/api/incident-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId: pedido.id }),
    });

    const data = await res.json().catch(() => null);
    setIsError(!res.ok);
    setMensaje(
      data?.message ||
        (res.ok
          ? "⚠️ Incidencia registrada correctamente"
          : "❌ Error registrando incidencia")
    );
  } catch (err) {
    console.error("❌ Error registrando incidencia:", err);
    setIsError(true);
    setMensaje("❌ Error registrando incidencia");
  }
};

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      color: "black"
    }}>
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        width: "600px",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.3)"
      }}>
        <h2>{titulo}</h2>
        <p><strong>Número:</strong> {pedido.num}</p>
        <p><strong>Cliente:</strong> {pedido.sellto_customer_name}</p>
        <p><strong>Evento:</strong> {pedido.jmteventname}</p>
        <p><strong>Fecha carga:</strong> {pedido.furniture_load_date_jmt ? new Date(pedido.furniture_load_date_jmt).toLocaleString() : "-"}</p>
        <p><strong>Estado:</strong> {pedido.jmt_status}</p>

        <h3>Artículos</h3>
        {pedido.lineas.length > 0 ? (
          <ul>
            {pedido.lineas.map((linea, i) => (
              <LineaItem
                key={i}
                linea={linea}
                cantidad={cantidades[i]}
                setCantidad={(n) => setCantidades(prev => {
                  const copy = [...prev];
                  copy[i] = n;
                  return copy;
                })}
              />
            ))}
          </ul>
        ) : <em>Sin artículos</em>}

        {mensaje && <p style={{ color: isError ? "red" : "green", fontWeight: "bold" }}>{mensaje}</p>}

        <button onClick={async () => { 
          actualizarStock(); 
          actualizarStatus();
          if (tipoAccion === "return") {
            const hayIncidencias = pedido.lineas.some(
              (linea, i) => cantidades[i] !== linea.cantidad
            );

            if (hayIncidencias) {
              await registrarIncidencia();
            }
          }
        }} style={{
          marginTop: "20px",
          padding: "8px 16px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "10px"
        }}>
          {tipoAccion === "ship" ? "Confirmar envío" : "Confirmar entrada"}
        </button>

        <button onClick={onClose} style={{
          marginTop: "20px",
          padding: "8px 16px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

// =======================
// Componente principal Pedidos
// =======================
function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [popupPedido, setPopupPedido] = useState<Pedido | null>(null);
  const [popupTitulo, setPopupTitulo] = useState<string>("");
  const [popupAccion, setPopupAccion] = useState<"ship" | "return">("ship");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/orders-db");
        const data: Pedido[] = await res.json();
        setPedidos(data);
      } catch (err) {
        console.error("❌ Error cargando pedidos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const openPopup = (pedido: Pedido, titulo: string, tipoAccion: "ship" | "return") => {
    setPopupPedido(pedido);
    setPopupTitulo(titulo);
    setPopupAccion(tipoAccion);
  };

  const closePopup = () => {
    setPopupPedido(null);
    setPopupTitulo("");
  };

  return (
    <div className="container-1">
      <button onClick={() => navigate("/")} style={{
        padding: "8px 16px",
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px"
      }}>
        ← Volver al inicio
      </button>

      <h1>Pedidos - WMS PREMIUM DELEVENT</h1>

      {loading ? (
        <p>Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p>No hay pedidos disponibles.</p>
      ) : (
        <table border={1} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Evento</th>
              <th>Fecha carga</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.num}</td>
                <td>{pedido.sellto_customer_name}</td>
                <td>{pedido.jmteventname}</td>
                <td>{pedido.furniture_load_date_jmt ? new Date(pedido.furniture_load_date_jmt).toLocaleString() : "-"}</td>
                <td>{pedido.jmt_status}</td>
                <td>
                  <button onClick={() => openPopup(pedido, "📦 Enviar pedido", "ship")}>Enviar pedido</button>
                  <button onClick={() => openPopup(pedido, "↩️ Entrada pedido", "return")}>Entrada pedido</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {popupPedido && (
        <PedidoPopup pedido={popupPedido} titulo={popupTitulo} tipoAccion={popupAccion} onClose={closePopup} />
      )}
    </div>
  );
}

// ✅ Export final
export default Pedidos;
