require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Pool } = require("pg");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 4000;

// =======================
// Variables de entorno BC
// =======================
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const bcEnvironment = process.env.BC_ENVIRONMENT;
const companyId = process.env.BC_COMPANY_ID;

// =======================
// Variables de entorno DB
// =======================
const dbUser = process.env.DB_USER;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;

// =======================
// Pool de conexión PostgreSQL
// =======================
const pool = new Pool({
  user: dbUser,
  host: dbHost,
  database: dbName,
  password: dbPassword,
  port: dbPort,
});

// =======================
// Funciones Business Central
// =======================
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

async function getBcProducts() {
  const token = await getBcAccessToken();
  if (!token) return [];
  const url = `https://api.businesscentral.dynamics.com/v2.0/${tenantId}/${bcEnvironment}/api/v2.0/companies(${companyId})/items`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      timeout: 60000,
    });
    return response.data.value || [];
  } catch (error) {
    console.error("❌ Error obteniendo productos:", error.response?.data || error.message);
    return [];
  }
}

async function getBcSalesLines() {
  const token = await getBcAccessToken();
  if (!token) return [];
  const url = `https://api.businesscentral.dynamics.com/v2.0/${tenantId}/${bcEnvironment}/ODataV4/Company('JMT%20PREMIUM%20DELEVENT%20S.L')/PDDetalleL%C3%ADneasPedidosVenta`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      timeout: 60000,
    });
    return response.data.value || [];
  } catch (error) {
    console.error("❌ Error obteniendo líneas de venta:", error.response?.data || error.message);
    return [];
  }
}

// =======================
// Middleware
// =======================
app.use(cors());

// =======================
// Endpoints
// =======================
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hola desde el backend 👋" });
});

app.get("/api/products", async (_req, res) => {
  const products = await getBcProducts();
  res.json({ products });
});

app.get("/api/sales-lines", async (_req, res) => {
  const salesLines = await getBcSalesLines();
  res.json({ salesLines });
});

app.get("/api/products-db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo productos desde DB:", error.message);
    res.status(500).json({ error: "Error obteniendo productos desde la base de datos" });
  }
});

app.get("/api/intercambios-db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM intercambios");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo intercambios desde DB:", error.message);
    res.status(500).json({ error: "Error obteniendo intercambios desde la base de datos" });
  }
});

// =======================
// Sincronización periódica
// =======================
async function syncProductsToDb() {
  try {
    console.log("🔄 Sincronizando productos desde BC a la DB...");
    const bcProducts = await getBcProducts();

    for (const p of bcProducts) {
      const { displayName, number, itemCategoryCode } = p;

      await pool.query(
        `
        INSERT INTO products (id, name, category, stock)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id)
        DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category
        `,
        [number, displayName, itemCategoryCode, 0]
      );
    }

    console.log(`✅ Sincronización completada: ${bcProducts.length} productos`);
  } catch (err) {
    console.error("❌ Error sincronizando productos:", err.message);
  }
}

async function syncIntercambiosToDb() {
  try {
    console.log("🔄 Sincronizando intercambios desde BC a la DB...");
    const bcIntercambios = await getBcSalesLines();

    for (const p of bcIntercambios) {
      // Ojo con las propiedades: revisa si es Document_No o documentNo
      const documentNo = p.Document_No || p.documentNo || "SIN_DOC";
      const description = p.Description || "";
      const locationCode = p.Location_Code || "";
      const shortcutDim = p.Shortcut_Dimension_1_Code || "";

      await pool.query(
        `
        INSERT INTO intercambios (documentNo, description, location_code, shortcut_dimension_1_code)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id)
        DO UPDATE SET 
          documentNo = EXCLUDED.documentNo,
          description = EXCLUDED.description,
          location_code = EXCLUDED.location_code,
          shortcut_dimension_1_code = EXCLUDED.shortcut_dimension_1_code
        `,
        [documentNo, description, locationCode, shortcutDim]
      );
    }

    console.log(`✅ Sincronización completada: ${bcIntercambios.length} intercambios`);
  } catch (err) {
    console.error("❌ Error sincronizando intercambios:", err.message);
  }
}

// Ejecutar sincronización al arrancar
syncProductsToDb();
syncIntercambiosToDb();

// Cron job: cada 30 minutos
cron.schedule("*/30 * * * *", () => {
  syncProductsToDb();
  syncIntercambiosToDb();
});

// =======================
// Iniciar servidor
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
