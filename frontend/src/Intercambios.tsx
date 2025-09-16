import { useEffect, useState } from "react";

interface Intercambio {
  id: number;
  documentno: string;
  description: string;
  location_code: string;
  shortcut_dimension_1_code: string;
}

function Intercambios() {
  const [intercambios, setIntercambios] = useState<Intercambio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/intercambios-db")
      .then((res) => res.json())
      .then((data: Intercambio[]) => {
        console.log(data);
        setIntercambios(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error cargando intercambios:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-1">
      <h1>Intercambios - WMS PREMIUM DELEVENT</h1>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #ddd",
              borderTop: "4px solid #6c757d",
              borderRadius: "50%",
              margin: "0 auto 15px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p>Cargando resultados...</p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      ) : (
        <table border={1} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Location Code</th>
              <th>Shortcut Dimension 1 Code</th>
              <th>Document No</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {intercambios
              .filter(
                (line) =>
                  line.location_code?.slice(2) !==
                  line.shortcut_dimension_1_code
              )
              .map((line) => (
                <tr key={line.id}>
                  <td>{line.id}</td>
                  <td>{line.location_code}</td>
                  <td>{line.shortcut_dimension_1_code}</td>
                  <td>{line.documentno}</td>
                  <td>{line.description}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Intercambios;
