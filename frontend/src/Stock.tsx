import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Product {
  displayName: string;
  number: string;
  itemCategoryCode: string;
}

function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const allProducts: Product[] = data.products.flat();
        setProducts(allProducts);
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

      <h1>Stock - WMS PREMIUM DELEVENT</h1>

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
              <th>Display Name</th>
              <th>Number</th>
              <th>Category</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td>{product.displayName}</td>
                <td>{product.number}</td>
                <td>{product.itemCategoryCode}</td>
                <td>0</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Stock;
