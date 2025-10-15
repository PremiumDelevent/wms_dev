import { useEffect, useState, useCallback, useMemo } from "react";
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
  uniqueId: string;
}

// =======================
// LineaItem - Memoizado
// =======================
interface LineaItemProps {
  linea: Linea;
  index: number;
  cantidad: number;
  setCantidad: (idx: number, n: number) => void;
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
        <div style={{ fontSize: "12px", color: "#666" }}>Teórico: {linea.cantidad}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={() => setCantidad(index, Math.max(cantidad - 1, 0))}
          style={{ padding: "4px 8px", cursor: "pointer" }}
        >
          -
        </button>
        <div style={{ minWidth: "28px", textAlign: "center" }}>{cantidad}</div>
        <button
          onClick={() => setCantidad(index, cantidad + 1)}
          style={{ padding: "4px 8px", cursor: "pointer" }}
        >
          +
        </button>
      </div>
    </li>
  );
};

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
  const [cantidades, setCantidades] = useState<number[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);

  useEffect(() => {
    if (order) {
      setCantidades(order.lineas.map(l => l.cantidad));
      setSelected(order.lineas.map(() => false));
    }
  }, [order]);

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

  const handleAddToPallet = useCallback(() => {
    if (!order) return;

    const lineasSeleccionadas = order.lineas.filter((_, i) => selected[i]);
    const cantidadesSeleccionadas = cantidades.filter((_, i) => selected[i]);

    if (lineasSeleccionadas.length === 0) {
      setIsError(true);
      setMensaje("⚠️ Marca al menos una línea para añadir al palet");
      return;
    }

    addToPallet(lineasSeleccionadas, cantidadesSeleccionadas, order.num);
    setIsError(false);
    setMensaje("✅ Añadido al palet");
    
    setTimeout(() => onClose(), 800);
  }, [order, selected, cantidades, addToPallet, onClose]);

  if (!order) return null;

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
        <h2 style={{ marginTop: 0 }}>{`Pedido ${order.num} — ${order.sellto_customer_name}`}</h2>
        <div style={{ marginBottom: "8px" }}>
          <strong>Evento:</strong> {order.jmteventname} &nbsp;|&nbsp;
          <strong>Fecha carga:</strong> {order.furniture_load_date_jmt ? new Date(order.furniture_load_date_jmt).toLocaleString() : "-"} &nbsp;|&nbsp;
          <strong>Estado:</strong> {order.jmt_status}
        </div>

        <h3>Artículos</h3>
        {order.lineas.length === 0 ? (
          <em>Sin artículos</em>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {order.lineas.map((linea, i) => (
              <LineaItem
                key={`${order.num}-${i}`}
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
  const [procesando, setProcesando] = useState<boolean>(false);

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 50;

  const [filters, setFilters] = useState({
    num: "",
    cliente: "",
    evento: "",
    estado: "",
  });

  const navigate = useNavigate();

  // Cargar orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/orders-db");
        if (!res.ok) throw new Error("Error en la respuesta");
        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("❌ Error cargando orders:", err);
        setIsError(true);
        setMensaje("Error cargando pedidos");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Auto-limpiar mensajes
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const openPopup = useCallback((order: Order) => setPopupOrder(order), []);
  const closePopup = useCallback(() => setPopupOrder(null), []);

  const addToPallet = useCallback((lineas: Linea[], cantidades: number[], orderNum: string) => {
    const timestamp = Date.now();
    const nuevosItems: PalletLinea[] = lineas.map((linea, i) => ({
      producto_id: linea.producto_id,
      descripcion: linea.descripcion,
      cantidad: cantidades[i],
      orderNum,
      uniqueId: `${orderNum}-${timestamp}-${i}`,
    }));

    setPalletLineas(prev => [...prev, ...nuevosItems]);
  }, []);

  const crearPalletGlobal = useCallback(async () => {
    if (procesando) return;
    
    if (palletLineas.length === 0) {
      setIsError(true);
      setMensaje("⚠️ No hay productos en el palet");
      return;
    }

    setProcesando(true);

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
      // 1️⃣ Crear palet
      const res = await fetch("http://localhost:4000/api/set-pallets-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(palletAPreparar),
      });

      if (!res.ok) throw new Error("Error creando palet");

      // 2️⃣ Agrupar líneas por pedido
      const lineasPorPedido: Record<string, PalletLinea[]> = {};
      palletLineas.forEach(l => {
        if (!lineasPorPedido[l.orderNum]) lineasPorPedido[l.orderNum] = [];
        lineasPorPedido[l.orderNum].push(l);
      });

      // 3️⃣ Para cada pedido, restar las cantidades y actualizar en la DB
      for (const [orderNum, lineas] of Object.entries(lineasPorPedido)) {
        const order = orders.find(o => o.num === orderNum);
        if (!order) continue;

        const nuevasLineas = order.lineas.map(linea => {
          const usada = lineas.find(l => l.producto_id === linea.producto_id);
          if (usada) {
            return {
              ...linea,
              cantidad: Math.max(linea.cantidad - usada.cantidad, 0)
            };
          }
          return linea;
        });

        // 4️⃣ Llamada a la API para actualizar el pedido
        await fetch("http://localhost:4000/api/modify-order-db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            num: orderNum,
            lineas: nuevasLineas
          }),
        });
      }

      setIsError(false);
      setMensaje(`✅ Palet creado y pedidos actualizados: ${evento}`);
      setPalletLineas([]);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMensaje("❌ Error creando palet o actualizando pedidos");
    } finally {
      setProcesando(false);
    }
  }, [procesando, palletLineas, orders]);


  const eliminarLineaPallet = useCallback((uniqueId: string) => {
    setPalletLineas(prev => prev.filter(p => p.uniqueId !== uniqueId));
  }, []);

  // FILTRADO OPTIMIZADO: Solo filtramos si hay texto en los filtros
  const filteredOrders = useMemo(() => {
    const hasFilters = filters.num || filters.cliente || filters.evento || filters.estado;
    
    if (!hasFilters) return orders;

    const numLower = filters.num.toLowerCase();
    const clienteLower = filters.cliente.toLowerCase();
    const eventoLower = filters.evento.toLowerCase();
    const estadoLower = filters.estado.toLowerCase();

    return orders.filter(order => {
      return (
        (!filters.num || order.num?.toLowerCase().includes(numLower)) &&
        (!filters.cliente || order.sellto_customer_name?.toLowerCase().includes(clienteLower)) &&
        (!filters.evento || order.jmteventname?.toLowerCase().includes(eventoLower)) &&
        (!filters.estado || order.jmt_status?.toLowerCase().includes(estadoLower))
      );
    });
  }, [orders, filters]);

  // PAGINACIÓN
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div style={{ padding: "18px", maxWidth: "1400px", margin: "0 auto" }}>
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
      <p style={{ color: "#6b7280" }}>Total pedidos: {orders.length} | Filtrados: {filteredOrders.length}</p>

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

      {/* Palet */}
      <div style={{ 
        marginBottom: "20px", 
        padding: "15px", 
        background: "grey", 
        borderRadius: "8px",
        border: "2px solid #e5e7eb"
      }}>
        <h3 style={{ marginTop: 0 }}>Palet actual: ({palletLineas.length} líneas)</h3>
        {palletLineas.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No hay productos añadidos.</p>
        ) : (
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {palletLineas.map((p) => (
                <li key={p.uniqueId} style={{ 
                  marginBottom: "6px", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "6px",
                  background: "black",
                  borderRadius: "4px"
                }}>
                  <span style={{ fontSize: "13px" }}>
                    <strong>{p.orderNum}</strong> — {p.descripcion} x {p.cantidad}
                  </span>
                  <button
                    onClick={() => eliminarLineaPallet(p.uniqueId)}
                    style={{ 
                      padding: "4px 8px", 
                      background: "#ef4444", 
                      color: "#fff", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={crearPalletGlobal}
          disabled={procesando || palletLineas.length === 0}
          style={{
            marginTop: "10px",
            padding: "10px 16px",
            background: procesando ? "#9ca3af" : "#0ea5e9",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: procesando || palletLineas.length === 0 ? "not-allowed" : "pointer",
            opacity: procesando || palletLineas.length === 0 ? 0.6 : 1,
            fontWeight: "bold"
          }}
        >
          {procesando ? "Procesando..." : "🚀 Crear palet global"}
        </button>
      </div>

      {popupOrder && <OrderPopup order={popupOrder} onClose={closePopup} addToPallet={addToPallet} />}

      {/* Filtros */}
      <div style={{ 
        marginBottom: "15px", 
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "8px"
      }}>
        <input
          placeholder="🔍 Número"
          value={filters.num}
          onChange={(e) => setFilters(f => ({ ...f, num: e.target.value }))}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px" }}
        />
        <input
          placeholder="🔍 Cliente"
          value={filters.cliente}
          onChange={(e) => setFilters(f => ({ ...f, cliente: e.target.value }))}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px" }}
        />
        <input
          placeholder="🔍 Evento"
          value={filters.evento}
          onChange={(e) => setFilters(f => ({ ...f, evento: e.target.value }))}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px" }}
        />
        <input
          placeholder="🔍 Estado"
          value={filters.estado}
          onChange={(e) => setFilters(f => ({ ...f, estado: e.target.value }))}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px" }}
        />
      </div>

      {/* Paginación superior */}
      {totalPages > 1 && (
        <div style={{ marginBottom: "15px", display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "6px 12px",
              background: currentPage === 1 ? "#e5e7eb" : "#3b82f6",
              color: currentPage === 1 ? "#9ca3af" : "white",
              border: "none",
              borderRadius: "6px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer"
            }}
          >
            ← Anterior
          </button>
          <span style={{ fontWeight: "bold" }}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "6px 12px",
              background: currentPage === totalPages ? "#e5e7eb" : "#3b82f6",
              color: currentPage === totalPages ? "#9ca3af" : "white",
              border: "none",
              borderRadius: "6px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer"
            }}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "18px" }}>⏳ Cargando pedidos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#f9fafb", borderRadius: "8px" }}>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>No hay pedidos que coincidan con los filtros</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "grey" }}>
              <thead>
                <tr style={{ background: "grey", borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "12px", textAlign: "center" }}>Número</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Cliente</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Evento</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Fecha carga</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Estado</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px" }}><strong>{order.num}</strong></td>
                    <td style={{ padding: "10px" }}>{order.sellto_customer_name}</td>
                    <td style={{ padding: "10px" }}>{order.jmteventname}</td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {order.furniture_load_date_jmt 
                        ? new Date(order.furniture_load_date_jmt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <span style={{
                        padding: "4px 8px",
                        background: "#dbeafe",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        {order.jmt_status}
                      </span>
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <button
                        onClick={() => openPopup(order)}
                        style={{
                          padding: "6px 12px",
                          background: "#06b6d4",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px"
                        }}
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación inferior */}
          {totalPages > 1 && (
            <div style={{ marginTop: "15px", display: "flex", gap: "8px", alignItems: "center", justifyContent: "center" }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  background: currentPage === 1 ? "#e5e7eb" : "#3b82f6",
                  color: currentPage === 1 ? "#9ca3af" : "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer"
                }}
              >
                ← Anterior
              </button>
              <span style={{ fontWeight: "bold" }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  background: currentPage === totalPages ? "#e5e7eb" : "#3b82f6",
                  color: currentPage === totalPages ? "#9ca3af" : "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}