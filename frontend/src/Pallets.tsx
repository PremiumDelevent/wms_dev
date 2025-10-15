import { useNavigate } from "react-router-dom";
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
function Pallets() {

    const [pallets, setPallets] = useState<Pallet[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchOrders = async () => {
          setLoading(true);
          try {
            const res = await fetch("http://localhost:4000/api/pallets-db");
            const data: Pallet[] = await res.json();
            setPallets(data);
          } catch (err) {
            console.error("❌ Error cargando pallets:", err);
          } finally {
            setLoading(false);
          }
        };
        fetchOrders();
      }, []);


    const navigate = useNavigate();
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

            <h1 style={{ marginTop: 0 }}>Pallets - WMS PREMIUM DELEVENT</h1>

            {/* Tabla de orders */}
            {loading ? (
                <p>Cargando orders...</p>
            ) : pallets.length === 0 ? (
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
                    {pallets.map((pallet) => (
                    <tr key={pallet.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "8px" }}>{pallet.id}</td>
                        <td style={{ padding: "8px" }}>{pallet.sellto_customer_name}</td>
                        <td style={{ padding: "8px" }}>{pallet.jmteventname}</td>
                        <td style={{ padding: "8px" }}>
                        {pallet.furniture_load_date_jmt ? new Date(pallet.furniture_load_date_jmt).toLocaleString() : "-"}
                        </td>
                        <td style={{ padding: "8px" }}>{pallet.jmt_status}</td>
                        <td style={{ padding: "8px", display: "flex", gap: "8px" }}>
                        <button
                            onClick={() => navigate(`/pallet/${pallet.id}`)}
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

export default Pallets;
