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

interface Incident {
  id: number;
  num: string;
  sellto_customer_name: string;
  furniture_load_date_jmt: string | null;
  jmt_status: string;
  jmteventname: string;
  lineas: Linea[];
}

interface IncidentPopupProps {
  incident: Incident | null;
  title: string;
  typeAction: "modify" | "close";
  onClose: () => void;
}

interface LineaItemProps {
  linea: Linea;
  cantidad: number;
  recuperado: number;
  setCantidadRecuperada: (n: number) => void;
}

// =======================
// Componentes
// =======================
const LineaItem = ({ linea, cantidad, recuperado, setCantidadRecuperada }: LineaItemProps) => {
  const maxRecuperable = Math.abs(cantidad);

  return (
    <li style={{ marginBottom: "6px" }}>
      {linea.producto_id ?? "SIN_ID"} - {linea.descripcion} (x{cantidad}) 
      <br />
      Recuperado: (x{recuperado})
      <button
        onClick={() => setCantidadRecuperada(Math.max(recuperado - 1, 0))}
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
        onClick={() => setCantidadRecuperada(Math.min(recuperado + 1, maxRecuperable))}
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
};

function IncidentPopup({ incident, title, typeAction, onClose }: IncidentPopupProps) {
  // ✅ hooks siempre al inicio
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [cantidadesRecuperadas, setCantidadesRecuperadas] = useState<number[]>(incident?.lineas.map(() => 0) || []);

  if (!incident) return null;

  const deleteIncident = async () => {
    try {
      const endpoint = "http://localhost:4000/api/delete-incidents-db";

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          num: incident.num,
        }),
      });

      const data = await res.json().catch(() => null);
      setIsError(!res.ok);
      setMensaje(data?.message || (res.ok ? "✅ Incident eliminado correctamente" : "❌ Error eliminando incident"));
    } catch (err) {
      console.error("❌ Error eliminando incident", err);
      setIsError(true);
      setMensaje("❌ Error eliminando incident");
    }
  };

  const modifyIncident = async () => {
    try {
      const endpoint = "http://localhost:4000/api/return-order";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: incident.id,
          productos: incident.lineas.map((linea, i) => ({
            producto_id: linea.producto_id,
            descripcion: linea.descripcion,
            cantidad: cantidadesRecuperadas[i],
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
        <p><strong>Número:</strong> {incident.num}</p>
        <p><strong>Cliente:</strong> {incident.sellto_customer_name}</p>
        <p><strong>Evento:</strong> {incident.jmteventname}</p>
        <p><strong>Fecha carga:</strong> {incident.furniture_load_date_jmt ? new Date(incident.furniture_load_date_jmt).toLocaleString() : "-"}</p>
        <p><strong>Estado:</strong> {incident.jmt_status}</p>

        <h3>Artículos</h3>
        {incident.lineas.length > 0 ? (
          <ul>
            {incident.lineas.map((linea, i) => (
              <LineaItem
                key={i}
                linea={linea}
                cantidad={linea.cantidad}
                recuperado={cantidadesRecuperadas[i]}
                setCantidadRecuperada={(n) => setCantidadesRecuperadas(prev => {
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
          if (typeAction === "close") {
            await deleteIncident();
          }

          else{
            await modifyIncident();
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
          {typeAction === "modify" ? "Confirmar modificación" : "Confirmar cierre"}
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
// Componente principal incidents
// =======================
function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [popupIncident, setPopupIncident] = useState<Incident | null>(null);
  const [popupTitle, setPopupTitle] = useState<string>("");
  const [popupTypeAction, setPopupTypeAction] = useState<"modify" | "close">("modify");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/incidents-db");
        const data: Incident[] = await res.json();
        setIncidents(data);
      } catch (err) {
        console.error("❌ Error cargando incidents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const openPopup = (incident: Incident, title: string, typeAction: "modify" | "close") => {
    setPopupIncident(incident);
    setPopupTitle(title);
    setPopupTypeAction(typeAction);
  };

  const closePopup = () => {
    setPopupIncident(null);
    setPopupTitle("");
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

      <h1>Incidents - WMS PREMIUM DELEVENT</h1>

      {loading ? (
        <p>Cargando incidents...</p>
      ) : incidents.length === 0 ? (
        <p>No hay incidents disponibles.</p>
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
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.num}</td>
                <td>{incident.sellto_customer_name}</td>
                <td>{incident.jmteventname}</td>
                <td>{incident.furniture_load_date_jmt ? new Date(incident.furniture_load_date_jmt).toLocaleString() : "-"}</td>
                <td>{incident.jmt_status}</td>
                <td>
                  <button onClick={() => openPopup(incident, "⚙️ Modificar incident", "modify")}>Modificar incident</button>
                  <button onClick={() => openPopup(incident, "❌ Cerrar incident", "close")}>Cerrar incident</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {popupIncident && (
        <IncidentPopup incident={popupIncident} title={popupTitle} typeAction={popupTypeAction} onClose={closePopup} />
      )}
    </div>
  );
}

// ✅ Export final
export default Incidents;
