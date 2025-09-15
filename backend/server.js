require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 4000;

// Variables de entorno
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const bcEnvironment = process.env.BC_ENVIRONMENT;
const companyId = process.env.BC_COMPANY_ID;

// ✅ Función acceso token Business Central
async function getBcAccessToken() {
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("scope", "https://api.businesscentral.dynamics.com/.default");

    const response = await axios.post(url, params);
    return response.data.access_token || null;
  } catch (error) {
    console.error("❌ Error obteniendo access_token:", error.response?.data || error.message);
    return null;
  }
}

// ✅ Función para obtener productos Business Central
async function getBcProducts() {
  const token = await getBcAccessToken();
  if (!token) {
    console.error("No se pudo obtener el token de BC");
    return [];
  }

  const url = `https://api.businesscentral.dynamics.com/v2.0/${tenantId}/${bcEnvironment}/api/v2.0/companies(${companyId})/items`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      timeout: 60000,
    });

    const data = response.data;
    return data.value || [];
  } catch (error) {
    console.error("❌ Error obteniendo productos:", error.response?.data || error.message);
    return [];
  }
}

// ✅ Función para obtener lineas de venta Business Central
async function getBcSalesLines() {
  const token = await getBcAccessToken();
  if (!token) {
    console.error("No se pudo obtener el token de BC");
    return [];
  } 
  const url = `https://api.businesscentral.dynamics.com/v2.0/${tenantId}/${bcEnvironment}/ODataV4/Company('JMT%20PREMIUM%20DELEVENT%20S.L')/PDDetalleL%C3%ADneasPedidosVenta`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      timeout: 60000,
    });

    const data = response.data;
    return data.value || [];
  } catch (error) {
    console.error("❌ Error obteniendo líneas de venta:", error.response?.data || error.message);
    return [];
  }
}

// ✅ Middleware CORS
app.use(cors());

// Endpoint hello world
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hola desde el backend 👋" });
});

// Endpoint para obtener productos
app.get("/api/products", async (_req, res) => {
  const products = await getBcProducts();
  res.json({ products });
});

// Endpoint para obtener líneas de venta
app.get("/api/sales-lines", async (_req, res) => {
  const salesLines = await getBcSalesLines();
  res.json({ salesLines });
});



// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});