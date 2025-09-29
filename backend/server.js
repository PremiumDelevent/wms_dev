//=======================
// Requirements
//=======================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
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
const PgProductRepository = require("./infrastructure/database/pg/PgProductRepository");
const BusinessCentralProductsService = require("./infrastructure/external/BusinessCentralProductsService");
const PgIntercambiosRepository = require("./infrastructure/database/pg/PgIntercambiosRepository");
const BusinessCentralExchangesService = require("./infrastructure/external/BusinessCentralExchangesService");


// =======================
// Schedulers
// =======================
const OrdersSyncScheduler = require("./infrastructure/scheduler/OrdersSyncScheduler");
const ProductsSyncScheduler = require("./infrastructure/scheduler/ProductsSyncScheduler");
const ExchangesSyncScheduler = require("./infrastructure/scheduler/ExchangesSyncScheduler");

// =======================
// App setup
// =======================
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 4000;

// =======================
// Pool de conexión PostgreSQL
// =======================
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

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

// Dependencias
const ordersRepository = new PgOrdersRepository({ pool });
const businessCentralOrdersService = new BusinessCentralOrdersService();
const productRepository = new PgProductRepository({ pool });
const businessCentralProductsService = new BusinessCentralProductsService();
const exchangesRepository = new PgIntercambiosRepository({ pool });
const businessCentralExchangesService = new BusinessCentralExchangesService();

// =======================
// Schedulers
// =======================
const syncScheduler = new OrdersSyncScheduler({ ordersRepository, businessCentralOrdersService });
const syncProductsScheduler = new ProductsSyncScheduler({ productRepository, businessCentralProductsService });
const syncExchangesScheduler = new ExchangesSyncScheduler({ exchangesRepository, businessCentralExchangesService });

// =======================
// Sincronización periódica
// =======================
syncScheduler.start();
syncProductsScheduler.start();
syncExchangesScheduler.start();

// =======================
// Iniciar servidor
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});