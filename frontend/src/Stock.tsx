import { useEffect, useState, useRef } from "react";

interface Product {
  id: string;       // id de BC que usamos en la DB
  name: string;
  category: string;
  stock: number;
}

function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState({
    id: "",
    name: "",
    category: "",
  });

  const idRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:4000/api/products-db")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Datos cargados al montar:", data);
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filtrado según los filtros aplicados
  const filteredProducts = products.filter((product) => {
    return (
      product.id.toLowerCase().includes(filters.id.toLowerCase()) &&
      product.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      product.category.toLowerCase().includes(filters.category.toLowerCase())
    );
  });

  return (
    <div className="container-1">
      <h1>Stock - WMS PREMIUM DELEVENT</h1>

      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          defaultValue={filters.id}
          ref={idRef}
          onChange={(e) => {
            if (e.target.value === "") {
              setFilters(f => ({ ...f, id: "" }));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") setFilters(f => ({ ...f, id: idRef.current?.value || "" }));
          }}
          placeholder="Filtrar por ID"
          style={{ marginRight: "10px", padding: "4px" }}
        />
        <input
          type="text"
          defaultValue={filters.name}
          ref={nameRef}
          onChange={(e) => {
            if (e.target.value === "") {
              setFilters(f => ({ ...f, name: "" }));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") setFilters(f => ({ ...f, name: nameRef.current?.value || "" }));
          }}
          placeholder="Filtrar por nombre"
          style={{ marginRight: "10px", padding: "4px" }}
        />
        <input
          type="text"
          defaultValue={filters.category}
          ref={categoryRef}
          onChange={(e) => {
            if (e.target.value === "") {
              setFilters(f => ({ ...f, category: "" }));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") setFilters(f => ({ ...f, category: categoryRef.current?.value || "" }));
          }}
          placeholder="Filtrar por categoría"
          style={{ padding: "4px" }}
        />
      </div>

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
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Stock;
