import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// =======================
// Interfaces
// =======================
interface Linea {
  producto_id: string | null;
  descripcion: string;
  cantidad: number;
}

interface Order {
  id: number;
  num: string;
  sellto_customer_name: string;
  furniture_load_date_jmt: string | null;
  jmt_status: string;
  jmteventname: string;
  lineas: Linea[];
}

interface OrderPopupProps {
  order: Order | null;
  title: string;
  typeAction: "ship" | "return";
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

function OrderPopup({ order, title, typeAction, onClose }: OrderPopupProps) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [cantidades, setCantidades] = useState<number[]>(order?.lineas.map(l => l.cantidad) || []);

  if (!order) return null;

  const actualizarStock = async () => {
    try {
      const endpoint = typeAction === "ship"
        ? "http://localhost:4000/api/ship-order"
        : "http://localhost:4000/api/return-order";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          productos: order.lineas.map((linea, i) => ({
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
        typeAction === "ship"
          ? "http://localhost:4000/api/ship-status"
          : "http://localhost:4000/api/return-status";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
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

  const setIncidentToIncidentsDb = async () => {
    try {
      const modifiedLines = order.lineas
        .map((linea, i) => {
          const diferencia = cantidades[i] - linea.cantidad;
          return { 
            producto_id: linea.producto_id,
            descripcion: linea.descripcion,
            cantidad: diferencia
          };
        })
        .filter((linea) => linea.cantidad !== 0);

      if (modifiedLines.length === 0) {
        setMensaje("⚠️ No hay líneas modificadas, no se registra incidencia");
        return;
      }

      const res = await fetch("http://localhost:4000/api/set-incidents-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          num: order.num,
          sellto_customer_name: order.sellto_customer_name,
          furniture_load_date_jmt: order.furniture_load_date_jmt,
          jmt_status: order.jmt_status,
          jmteventname: order.jmteventname,
          lineas: modifiedLines,
        }),
      });

      const data = await res.json().catch(() => null);
      setIsError(!res.ok);
      setMensaje(
        data?.message ||
          (res.ok
            ? "✅ Incidencia insertada/actualizada correctamente"
            : "❌ Error insertando incidencia")
      );
    } catch (err) {
      console.error("❌ Error insertando incidencia:", err);
      setIsError(true);
      setMensaje("❌ Error insertando incidencia");
    }
  };

  const setStatusIncidentToOrderDb = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/incident-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
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
        <h2>{title}</h2>
        <p><strong>Número:</strong> {order.num}</p>
        <p><strong>Cliente:</strong> {order.sellto_customer_name}</p>
        <p><strong>Evento:</strong> {order.jmteventname}</p>
        <p><strong>Fecha carga:</strong> {order.furniture_load_date_jmt ? new Date(order.furniture_load_date_jmt).toLocaleString() : "-"}</p>
        <p><strong>Estado:</strong> {order.jmt_status}</p>

        <h3>Artículos</h3>
        {order.lineas.length > 0 ? (
          <ul>
            {order.lineas.map((linea, i) => (
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
          if (typeAction === "return") {
            const hayIncidencias = order.lineas.some(
              (linea, i) => cantidades[i] !== linea.cantidad
            );

            if (hayIncidencias) {
              await setStatusIncidentToOrderDb();
              await setIncidentToIncidentsDb();
            }

            else{
              actualizarStatus();
            }
          }

          else{
            actualizarStatus();
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
          {typeAction === "ship" ? "Confirmar envío" : "Confirmar entrada"}
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
// Componente principal Orders
// =======================
function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [popupOrder, setPopupOrder] = useState<Order | null>(null);
  const [popupTitle, setPopupTitle] = useState<string>("");
  const [popupTypeAction, setPopupTypeAction] = useState<"ship" | "return">("ship");

  const [filters, setFilters] = useState({
    num: "",
    cliente: "",
    evento: "",
    estado: "",
  });

  const navigate = useNavigate();

  const numRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const eventoRef = useRef<HTMLInputElement>(null);
  const estadoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/orders-db");
        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("❌ Error cargando orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const openPopup = (order: Order, title: string, typeAction: "ship" | "return") => {
    setPopupOrder(order);
    setPopupTitle(title);
    setPopupTypeAction(typeAction);
  };

  const closePopup = () => {
    setPopupOrder(null);
    setPopupTitle("");
  };

  // Filtrado de orders según filters
  const filteredOrders = orders.filter(order => {
    return (
      order.num?.toLowerCase().includes(filters.num.toLowerCase()) &&
      order.sellto_customer_name?.toLowerCase().includes(filters.cliente.toLowerCase()) &&
      order.jmteventname?.toLowerCase().includes(filters.evento.toLowerCase()) &&
      order.jmt_status?.toLowerCase().includes(filters.estado.toLowerCase())
    );
  });

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

      <h1>Orders - WMS PREMIUM DELEVENT</h1>

      {loading ? (
        <p>Cargando orders...</p>
      ) : orders.length === 0 ? (
        <p>No hay orders disponibles.</p>
      ) : (
        <table border={1} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr>
              <th>
                Número
                <br />
                <input
                  type="text"
                  defaultValue={filters.num}
                  ref={numRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setFilters(f => ({ ...f, num: numRef.current?.value || "" }));
                  }}
                  placeholder="Buscar..."
                />
              </th>
              <th>
                Cliente
                <br />
                <input
                  type="text"
                  defaultValue={filters.cliente}
                  ref={clienteRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setFilters(f => ({ ...f, cliente: clienteRef.current?.value || "" }));
                  }}
                  placeholder="Buscar..."
                />
              </th>
              <th>
                Evento
                <br />
                <input
                  type="text"
                  defaultValue={filters.evento}
                  ref={eventoRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setFilters(f => ({ ...f, evento: eventoRef.current?.value || "" }));
                  }}
                  placeholder="Buscar..."
                />
              </th>
              <th>Fecha carga</th>
              <th>
                Estado
                <br />
                <input
                  type="text"
                  defaultValue={filters.estado}
                  ref={estadoRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setFilters(f => ({ ...f, estado: estadoRef.current?.value || "" }));
                  }}
                  placeholder="Buscar..."
                />
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.num}</td>
                <td>{order.sellto_customer_name}</td>
                <td>{order.jmteventname}</td>
                <td>{order.furniture_load_date_jmt ? new Date(order.furniture_load_date_jmt).toLocaleString() : "-"}</td>
                <td>{order.jmt_status}</td>
                <td>
                  <button onClick={() => openPopup(order, "📦 Enviar order", "ship")}>Enviar order</button>
                  <button onClick={() => openPopup(order, "↩️ Entrada order", "return")}>Entrada order</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {popupOrder && (
        <OrderPopup order={popupOrder} title={popupTitle} typeAction={popupTypeAction} onClose={closePopup} />
      )}
    </div>
  );
}

export default Orders;
