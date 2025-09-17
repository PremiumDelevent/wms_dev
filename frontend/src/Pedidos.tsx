import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Linea {
  id?: number;
  num: string;
  descr: string;
  quantity: number;
}

interface Pedido {
  id: number;
  num: string;
  sellto_customer_name: string;
  furniture_load_date_jmt: string | null;
  jmt_status: string;
  lines: Linea[];
}

function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedidos = async () => {
        setLoading(true);
        try {
        const res = await fetch("http://localhost:4000/api/pedidos-db");
        const data: Omit<Pedido, "lines">[] = await res.json(); // los pedidos vienen sin lines
        setPedidos(
            data.map((p) => ({
            ...p,
            lines: [] as Linea[], // agregamos lines vacío
            }))
        );
        } catch (err) {
        console.error("❌ Error cargando pedidos:", err);
        } finally {
        setLoading(false);
        }
    };

    fetchPedidos();
    }, []);

  return (
    <div className="container-1">
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "8px 16px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
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
              <th>Fecha carga</th>
              <th>Estado</th>
              <th>Artículos</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.num}</td>
                <td>{pedido.sellto_customer_name}</td>
                <td>
                  {pedido.furniture_load_date_jmt
                    ? new Date(pedido.furniture_load_date_jmt).toLocaleString()
                    : "-"}
                </td>
                <td>{pedido.jmt_status}</td>
                <td>
                  {pedido.lines.length > 0 ? (
                    pedido.lines.map((linea, i) => (
                      <div key={i}>
                        {linea.num} - {linea.descr} (x{linea.quantity})
                      </div>
                    ))
                  ) : (
                    <em>Sin artículos</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Pedidos;
