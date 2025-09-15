import { useEffect, useState } from "react";

interface SalesLine {
  Location_Code: string;
  Shortcut_Dimension_1_Code: string;
  Document_No: string;
  Description: string;
}

function Intercambios() {
  const [salesLines, setSalesLines] = useState<SalesLine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/sales-lines")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const allLines: SalesLine[] = data.salesLines.flat();
        setSalesLines(allLines);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
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
              <th>Location Code</th>
              <th>Shortcut Dimension 1 Code</th>
              <th>Document No</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {salesLines
              .filter(
                (line) =>
                  line.Location_Code.slice(2) !==
                  line.Shortcut_Dimension_1_Code
              )
              .map((line, index) => (
                <tr key={index}>
                  <td>{line.Location_Code}</td>
                  <td>{line.Shortcut_Dimension_1_Code}</td>
                  <td>{line.Document_No}</td>
                  <td>{line.Description}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Intercambios;
