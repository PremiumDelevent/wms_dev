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
const createHelloRouter = require("./infrastructure/api/http/routes/Hello/hello.routes");
const createProductsRouter = require("./infrastructure/api/http/routes/Products/products.routes");
const createExchangesRouter = require("./infrastructure/api/http/routes/Exchanges/exchanges.routes");
const createOrdersRouter = require("./infrastructure/api/http/routes/Orders/orders.routes");
const createIncreaseStockRouter = require("./infrastructure/api/http/routes/Products/increase-stock.routes");
const createDecreaseStockRouter = require("./infrastructure/api/http/routes/Products/decrease-stock.routes");
const createShipStatusRouter = require("./infrastructure/api/http/routes/Orders/ship-status.routes");
const createReturnStatusRouter = require("./infrastructure/api/http/routes/Orders/return-status.routes");
const createIncidentStatusRouter = require("./infrastructure/api/http/routes/Orders/incident-status.routes");
const createIncidentsRouter = require("./infrastructure/api/http/routes/Incidents/incidents.routes");
const createSetIncidentsRouter = require("./infrastructure/api/http/routes/Incidents/set-incidents.routes");
const createDeleteIncidentsRouter = require("./infrastructure/api/http/routes/Incidents/delete-incidents.routes");
const createModifyIncidentsRouter = require("./infrastructure/api/http/routes/Incidents/modify-incidents.routes");
const createSetPalletsRouter = require("./infrastructure/api/http/routes/Pallets/set-pallets.routes");

// =======================
// PG y Servicios
// =======================  
const PgOrdersRepository = require("./infrastructure/database/pg/Orders/PgOrdersRepository");
const BusinessCentralOrdersService = require("./infrastructure/external/BusinessCentralOrdersService");
const PgProductRepository = require("./infrastructure/database/pg/Products/PgProductRepository");
const BusinessCentralProductsService = require("./infrastructure/external/BusinessCentralProductsService");
const PgExchangesRepository = require("./infrastructure/database/pg/Exchanges/PgExchangesRepository");
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

// Router hexagonal /api/exchanges-db
app.use("/api", createExchangesRouter({ pool }));

// Router hexagonal /api/orders-db
app.use("/api", createOrdersRouter({ pool }));

// Router hexagonal /api/increase-stock
app.use("/api", createIncreaseStockRouter({ pool }));

// Router hexagonal /api/decrease-stock
app.use("/api", createDecreaseStockRouter({ pool }));

// Router hexagonal /api/ship-status
app.use("/api", createShipStatusRouter({ pool }));

// Router hexagonal /api/return-status
app.use("/api", createReturnStatusRouter({ pool }));

// Router hexagonal /api/incident-status
app.use("/api", createIncidentStatusRouter({ pool }));

// Router hexagonal /api/incidents-db
app.use("/api", createIncidentsRouter({ pool }));

// Router hexagonal /api/set-incidents-db
app.use("/api", createSetIncidentsRouter({ pool }));

// Router hexagonal /api/delete-incidents-db
app.use("/api", createDeleteIncidentsRouter({ pool }));

// Router hexagonal /api/modify-incidents-db
app.use("/api", createModifyIncidentsRouter({ pool }));

// Router hexagonal /api/set-pallets-db
app.use("/api", createSetPalletsRouter({ pool }));

// Dependencias
const ordersRepository = new PgOrdersRepository({ pool });
const businessCentralOrdersService = new BusinessCentralOrdersService();
const productRepository = new PgProductRepository({ pool });
const businessCentralProductsService = new BusinessCentralProductsService();
const exchangesRepository = new PgExchangesRepository({ pool });
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