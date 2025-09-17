import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Linea {
  description: string;
  no: string;
  quantity: number;
}

interface Pedido {
  No: string;
  SelltoCustomerName: string;
  furnitureLoadDateJMT: string;
  jmtStatus: string;
  lines: Linea[];
}

function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/api/albaranes")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Datos pedidos:", data);
        setPedidos(data.albaranes); // 👈 asegúrate de que tu backend devuelve { albaranes: [...] }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
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
            {pedidos.map((pedido, index) => (
              <tr key={index}>
                <td>{pedido.No}</td>
                <td>{pedido.SelltoCustomerName}</td>
                <td>{pedido.furnitureLoadDateJMT}</td>
                <td>{pedido.jmtStatus}</td>
                <td>
                  {pedido.lines && pedido.lines.length > 0 ? (
                    pedido.lines.map((linea, i) => (
                      <div key={i}>
                        {linea.no} - {linea.description} (x{linea.quantity})
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
