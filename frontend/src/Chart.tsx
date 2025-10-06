import { useRef, useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Order {
  id: number;
  jmt_status: string;
}

export default function Chart() {
  const chartRef = useRef(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Contamos las órdenes por estado
  const counts = orders.reduce(
    (acc, order) => {
      switch (order.jmt_status) {
        case "INCIDENCIA":
          acc.INCIDENCIA += 1;
          break;
        case "ENVIADO":
          acc.ENVIADO += 1;
          break;
        case "DEVUELTO":
          acc.DEVUELTO += 1;
          break;
        case "CONFIRMADO":
          acc.CONFIRMADO += 1;
          break;
        default:
          break;
      }
      return acc;
    },
    { INCIDENCIA: 0, ENVIADO: 0, DEVUELTO: 0, CONFIRMADO: 0 }
  );

  const data = {
    labels: ["INCIDENCIA", "ENVIADO", "DEVUELTO", "CONFIRMADO"],
    datasets: [
      {
        label: "Número de órdenes",
        data: [
          counts.INCIDENCIA,
          counts.ENVIADO,
          counts.DEVUELTO,
          counts.CONFIRMADO,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",   // INCIDENCIA
          "rgba(255, 206, 86, 0.6)",   // ENVIADO
          "rgba(75, 192, 192, 0.6)",   // DEVUELTO
          "rgba(54, 162, 235, 0.6)",   // CONFIRMADO
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) return <p>Cargando gráfico...</p>;

  return <Doughnut ref={chartRef} data={data} />;
}
