//=======================
// Requirements
//=======================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Pool } = require("pg");
const bodyParser = require("body-parser");

// =======================
// Routers
// =======================
const createHelloRouter = require("./infrastructure/api/http/routes/hello.routes");
const createProductsRouter = require("./infrastructure/api/http/routes/products.routes");
const createIntercambiosRouter = require("./infrastructure/api/http/routes/intercambios.routes");
const createOrdersRouter = require("./infrastructure/api/http/routes/orders.routes");
const createReturnOrderRouter = require("./infrastructure/api/http/routes/return-order.routes");
const createShipOrderRouter = require("./infrastructure/api/http/routes/ship-order.routes");
const createShipStatusRouter = require("./infrastructure/api/http/routes/ship-status.routes");
const createReturnStatusRouter = require("./infrastructure/api/http/routes/return-status.routes");
const createIncidentStatusRouter = require("./infrastructure/api/http/routes/incident-status.routes");

// =======================
// PG y Servicios
// =======================  
const PgOrdersRepository = require("./infrastructure/database/pg/PgOrdersRepository");
const BusinessCentralOrdersService = require("./infrastructure/external/BusinessCentralOrdersService");

// =======================
// Schedulers
// =======================
const OrdersSyncScheduler = require("./infrastructure/scheduler/OrdersSyncScheduler");

// =======================
// App setup
// =======================
const app = express();
app.use(bodyParser.json());
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
app.use(express.json());

// =======================
// Endpoints
// =======================

// Router hexagonal /api/hello
app.use("/api", createHelloRouter());

// Router hexagonal /api/products-db
app.use("/api", createProductsRouter({ pool }));

// Router hexagonal /api/intercambios-db
app.use("/api", createIntercambiosRouter({ pool }));

// Router hexagonal /api/orders-db
app.use("/api", createOrdersRouter({ pool }));

// Router hexagonal /api/return-order
app.use("/api", createReturnOrderRouter({ pool }));

// Router hexagonal /api/ship-order
app.use("/api", createShipOrderRouter({ pool }));

// Router hexagonal /api/ship-status
app.use("/api", createShipStatusRouter({ pool }));

// Router hexagonal /api/return-status
app.use("/api", createReturnStatusRouter({ pool }));

// Router hexagonal /api/incident-status
app.use("/api", createIncidentStatusRouter({ pool }));

/*
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
}*/

// Dependencias
const ordersRepository = new PgOrdersRepository({ pool });
const businessCentralOrdersService = new BusinessCentralOrdersService();


// =======================
// Sincronización periódica
// =======================
const syncScheduler = new OrdersSyncScheduler({ ordersRepository, businessCentralOrdersService });
syncScheduler.start();

// =======================
// Iniciar servidor
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});