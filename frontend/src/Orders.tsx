import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// =======================
// Tipos
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

interface PalletLinea {
  producto_id: string | null;
  descripcion: string;
  cantidad: number;
  orderNum: string;
}

// =======================
// LineaItem (presentación + controles cantidad + checkbox)
// =======================
interface LineaItemProps {
  linea: Linea;
  cantidad: number;
  setCantidad: (n: number) => void;
  checked: boolean;
  toggleCheck: () => void;
}

const LineaItem = ({ linea, cantidad, setCantidad, checked, toggleCheck }: LineaItemProps) => (
  <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
    <input type="checkbox" checked={checked} onChange={toggleCheck} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: "14px" }}>{linea.producto_id ?? "SIN_ID"} — {linea.descripcion}</div>
      <div style={{ fontSize: "12px", color: "#666" }}>Teórico: {linea.cantidad}</div>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <button
        onClick={() => setCantidad(Math.max(cantidad - 1, 0))}
        style={{ padding: "4px 8px", cursor: "pointer" }}
        aria-label="disminuir"
      >
        -
      </button>
      <div style={{ minWidth: "28px", textAlign: "center" }}>{cantidad}</div>
      <button
        onClick={() => setCantidad(cantidad + 1)}
        style={{ padding: "4px 8px", cursor: "pointer" }}
        aria-label="aumentar"
      >
        +
      </button>
    </div>
  </li>
);

// =======================
// OrderPopup
// =======================
interface OrderPopupProps {
  order: Order | null;
  onClose: () => void;
  addToPallet: (lineas: Linea[], cantidades: number[], orderNum: string) => void;
}

function OrderPopup({ order, onClose, addToPallet }: OrderPopupProps) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [cantidades, setCantidades] = useState<number[]>(order?.lineas.map(l => l.cantidad) || []);
  const [selected, setSelected] = useState<boolean[]>(order?.lineas.map(() => false) || []);

  useEffect(() => {
    setCantidades(order?.lineas.map(l => l.cantidad) || []);
    setSelected(order?.lineas.map(() => false) || []);
  }, [order]);

  if (!order) return null;

  const handleAddToPallet = () => {
    const lineasSeleccionadas = order.lineas.filter((_, i) => selected[i]);
    const cantidadesSeleccionadas = cantidades.filter((_, i) => selected[i]);

    if (lineasSeleccionadas.length === 0) {
      setIsError(true);
      setMensaje("⚠️ Marca al menos una línea para añadir al palet");
      return;
    }

    addToPallet(lineasSeleccionadas, cantidadesSeleccionadas, order.num);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 2000, padding: "20px"
    }}>
      <div style={{
        width: "720px", maxHeight: "85vh", overflowY: "auto", background: "#fff",
        borderRadius: "8px", padding: "18px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", color: "black"
      }}>
        <h2 style={{ marginTop: 0 }}>{`Pedido ${order.num} — ${order.sellto_customer_name}`}</h2>
        <div style={{ marginBottom: "8px" }}>
          <strong>Evento:</strong> {order.jmteventname} &nbsp;|&nbsp;
          <strong>Fecha carga:</strong> {order.furniture_load_date_jmt ? new Date(order.furniture_load_date_jmt).toLocaleString() : "-"} &nbsp;|&nbsp;
          <strong>Estado:</strong> {order.jmt_status}
        </div>

        <h3>Artículos (marca los que quieres añadir al palet)</h3>
        {order.lineas.length === 0 ? (
          <em>Sin artículos</em>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {order.lineas.map((linea, i) => (
              <LineaItem
                key={i}
                linea={linea}
                cantidad={cantidades[i] ?? linea.cantidad}
                setCantidad={(n) => setCantidades(prev => {
                  const copy = [...prev];
                  copy[i] = n;
                  return copy;
                })}
                checked={selected[i] ?? false}
                toggleCheck={() => setSelected(prev => {
                  const copy = [...prev];
                  copy[i] = !copy[i];
                  return copy;
                })}
              />
            ))}
          </ul>
        )}

        {mensaje && <p style={{ color: isError ? "red" : "green", fontWeight: "bold" }}>{mensaje}</p>}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button
            onClick={handleAddToPallet}
            style={{
              padding: "8px 14px",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Añadir al palet
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

// =======================
// Componente principal Orders
// =======================
export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [popupOrder, setPopupOrder] = useState<Order | null>(null);
  const [palletLineas, setPalletLineas] = useState<PalletLinea[]>([]);

  // =======================
  // Mensajes globales
  // =======================
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  // filtros
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

  const openPopup = (order: Order) => setPopupOrder(order);
  const closePopup = () => setPopupOrder(null);

  // Añadir líneas al palet global
  const addToPallet = (lineas: Linea[], cantidades: number[], orderNum: string) => {
    const nuevosItems = lineas.map((linea, i) => ({
      producto_id: linea.producto_id,
      descripcion: linea.descripcion,
      cantidad: cantidades[i],
      orderNum,
    }));
    setPalletLineas(prev => [...prev, ...nuevosItems]);
  };

  // Crear palet global
  const crearPalletGlobal = async () => {
    if (palletLineas.length === 0) {
      setIsError(true);
      setMensaje("⚠️ No hay productos en el palet");
      return;
    }

    // Recuperamos el evento de uno de los pedidos (ej. el primero)
    const primerPedido = orders.find(o => o.num === palletLineas[0].orderNum);
    const evento = primerPedido?.jmteventname ?? "SIN_EVENTO";
    const cliente = primerPedido?.sellto_customer_name ?? "SIN_CLIENTE";
    const fechaCarga = primerPedido?.furniture_load_date_jmt ?? null;

    const palletAPreparar = {
      sellto_customer_name: cliente,
      furniture_load_date_jmt: fechaCarga,
      jmteventname: evento,
      lineas: palletLineas,
    };

    try {
      const res = await fetch("http://localhost:4000/api/set-pallets-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(palletAPreparar),
      });

      if (!res.ok) throw new Error("Error creando palet");

      setIsError(false);
      setMensaje(`✅ Palet creado correctamente para el evento: ${evento}`);
      setPalletLineas([]); // vaciamos palet
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMensaje("❌ Error creando palet");
    }
  };

  const filteredOrders = orders.filter(order => {
    return (
      order.num?.toLowerCase().includes(filters.num.toLowerCase()) &&
      order.sellto_customer_name?.toLowerCase().includes(filters.cliente.toLowerCase()) &&
      order.jmteventname?.toLowerCase().includes(filters.evento.toLowerCase()) &&
      order.jmt_status?.toLowerCase().includes(filters.estado.toLowerCase())
    );
  });

  return (
    <div style={{ padding: "18px" }}>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "8px 12px", background: "#374151", color: "#fff", border: "none",
          borderRadius: "6px", cursor: "pointer", marginBottom: "12px"
        }}
      >
        ← Volver al inicio
      </button>

      <h1 style={{ marginTop: 0 }}>Orders - WMS PREMIUM DELEVENT</h1>

      {/* Mensaje global */}
      {mensaje && (
        <p style={{ color: isError ? "red" : "green", fontWeight: "bold" }}>
          {mensaje}
        </p>
      )}

      {/* Palet global */}
      <div style={{ marginTop: "20px" }}>
        <h3>Palet actual:</h3>
        {palletLineas.length === 0 ? <p>No hay productos añadidos.</p> : (
          <ul>
            {palletLineas.map((p, i) => (
              <li key={i}>{p.orderNum} — {p.descripcion} x {p.cantidad}</li>
            ))}
          </ul>
        )}
        <button
          onClick={crearPalletGlobal}
          style={{ marginTop: "10px", padding: "8px 14px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Crear palet global
        </button>
      </div>

      {/* Popup */}
      {popupOrder && <OrderPopup order={popupOrder} onClose={closePopup} addToPallet={addToPallet} />}

      {/* Filtros */}
      <div style={{ marginTop: "20px", marginBottom: "15px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input ref={numRef} placeholder="Número" value={filters.num} onChange={(e) => setFilters(f => ({ ...f, num: e.target.value }))} style={{ padding: "4px" }} />
        <input ref={clienteRef} placeholder="Cliente" value={filters.cliente} onChange={(e) => setFilters(f => ({ ...f, cliente: e.target.value }))} style={{ padding: "4px" }} />
        <input ref={eventoRef} placeholder="Evento" value={filters.evento} onChange={(e) => setFilters(f => ({ ...f, evento: e.target.value }))} style={{ padding: "4px" }} />
        <input ref={estadoRef} placeholder="Estado" value={filters.estado} onChange={(e) => setFilters(f => ({ ...f, estado: e.target.value }))} style={{ padding: "4px" }} />
      </div>

      {/* Tabla de orders */}
      {loading ? (
        <p>Cargando orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No hay orders disponibles.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "8px" }}>Número</th>
              <th style={{ padding: "8px" }}>Cliente</th>
              <th style={{ padding: "8px" }}>Evento</th>
              <th style={{ padding: "8px" }}>Fecha carga</th>
              <th style={{ padding: "8px" }}>Estado</th>
              <th style={{ padding: "8px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px" }}>{order.num}</td>
                <td style={{ padding: "8px" }}>{order.sellto_customer_name}</td>
                <td style={{ padding: "8px" }}>{order.jmteventname}</td>
                <td style={{ padding: "8px" }}>
                  {order.furniture_load_date_jmt ? new Date(order.furniture_load_date_jmt).toLocaleString() : "-"}
                </td>
                <td style={{ padding: "8px" }}>{order.jmt_status}</td>
                <td style={{ padding: "8px", display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => openPopup(order)}
                    style={{
                      padding: "6px 10px", background: "#06b6d4", color: "#fff",
                      border: "none", borderRadius: "6px", cursor: "pointer"
                    }}
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
