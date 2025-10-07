import { useEffect, useState } from "react";

interface Exchange {
  id: number;
  documentno: string;
  description: string;
  location_code: string;
  shortcut_dimension_1_code: string;
}

function Exchanges() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/exchanges-db")
      .then((res) => res.json())
      .then((data: Exchange[]) => {
        setExchanges(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error cargando exchanges:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-1">
      <h1>Exchanges - WMS PREMIUM DELEVENT</h1>

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
            {exchanges
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

export default Exchanges;
