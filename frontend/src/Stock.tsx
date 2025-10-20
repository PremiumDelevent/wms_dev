import { useEffect, useState, useRef } from "react";

// =======================
// Types
// =======================
import type { Product } from "./types/Product";
import type { ProductPopupProps } from "./types/ProductPopupProps";

function ProductPopup({ product, title, typeAction, onClose }: ProductPopupProps) {
  const [cantidad, setCantidad] = useState<number>(1);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  if (!product) return null;

  const actualizarStock = async () => {
    try {
      const endpoint =
        typeAction === "ship"
          ? "http://localhost:4000/api/decrease-stock"     // disminuir stock
          : "http://localhost:4000/api/increase-stock"; // aumentar stock

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: null,
          productos: [
            {
              producto_id: product.id,
              descripcion: product.name,
              cantidad,
            },
          ],
        }),
      });

      const data = await res.json().catch(() => null);
      setIsError(!res.ok);
      setMensaje(
        data?.message ||
          (res.ok
            ? "✅ Stock actualizado correctamente"
            : "❌ Error actualizando stock")
      );
    } catch (err) {
      console.error("❌ Error actualizando stock:", err);
      setIsError(true);
      setMensaje("❌ Error actualizando stock");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          width: "400px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
          color: "black",
        }}
      >
        <h2>{title}</h2>
        <p><strong>ID:</strong> {product.id}</p>
        <p><strong>Nombre:</strong> {product.name}</p>
        <p><strong>Categoría:</strong> {product.category}</p>
        <p><strong>Stock actual:</strong> {product.stock}</p>

        <div style={{ marginTop: "10px", marginBottom: "10px" }}>
          <label>
            Cantidad:&nbsp;
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
              style={{ width: "80px", textAlign: "center" }}
            />
          </label>
        </div>

        {mensaje && (
          <p style={{ color: isError ? "red" : "green", fontWeight: "bold" }}>
            {mensaje}
          </p>
        )}

        <button
          onClick={actualizarStock}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Confirmar
        </button>

        <button
          onClick={onClose}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);
  const [popupTitle, setPopupTitle] = useState<string>("");
  const [popupTypeAction, setPopupTypeAction] = useState<"ship" | "return">("ship");

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
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const openPopup = (product: Product, title: string, typeAction: "ship" | "return") => {
    setPopupProduct(product);
    setPopupTitle(title);
    setPopupTypeAction(typeAction);
  };

  const closePopup = () => {
    setPopupProduct(null);
    setPopupTitle("");
  };

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
            if (e.target.value === "") setFilters(f => ({ ...f, id: "" }));
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
            if (e.target.value === "") setFilters(f => ({ ...f, name: "" }));
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
            if (e.target.value === "") setFilters(f => ({ ...f, category: "" }));
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
              <th>Available</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>{product.available}</td>
                <td>
                  <button onClick={() => openPopup(product, "➕ Aumentar stock", "return")}>
                    Aumentar stock
                  </button>
                  <button onClick={() => openPopup(product, "➖ Disminuir stock", "ship")}>
                    Disminuir stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {popupProduct && (
        <ProductPopup
          product={popupProduct}
          title={popupTitle}
          typeAction={popupTypeAction}
          onClose={closePopup}
        />
      )}
    </div>
  );
}

export default Stock;
