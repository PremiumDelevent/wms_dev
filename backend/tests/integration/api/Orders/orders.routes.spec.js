const express = require("express");
const request = require("supertest");
const { newDb } = require("pg-mem");
const createOrdersRouter = require("../../../../infrastructure/api/http/routes/Orders/orders.routes");
const logger = require("../../../../infrastructure/logger/logger");

describe("/api/orders-db", () => {
  let app, pool;

  beforeAll(async () => {
    logger.info("Inicializando base de datos en memoria para tests");

    const db = newDb();
    db.public.none(`
      CREATE TABLE orders (id SERIAL PRIMARY KEY, num VARCHAR(50), sellto_customer_name TEXT, furniture_load_date_jmt TIMESTAMP NULL, jmt_status VARCHAR(50), lineas JSONB NOT NULL DEFAULT '[]', created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now(), jmtEventName VARCHAR(255));
      INSERT INTO orders (num, sellto_customer_name, furniture_load_date_jmt, jmt_status, lineas, created_at, updated_at, jmtEventName) VALUES ('A100', 'Cliente Test', '2025-10-23 10:00:00', 'ENVIADO', '[]', now(), now(), 'Evento Test');
    `);

    pool = new (db.adapters.createPg().Pool)();

    app = express();
    app.use(express.json());
    app.use("/api", createOrdersRouter({ pool }));

    logger.debug("Router de /api/orders-db montado correctamente");
  });

  afterAll(async () => {
    logger.info("Cerrando pool de base de datos");
    await pool.end();
  });

  test("✅ recupera todos los pedidos y devuelve 200", async () => {
    logger.info("Test: recupera todos los pedidos");

    const res = await request(app)
      .get("/api/orders-db")
      .expect(200);

    logger.info("Respuesta recibida: " + JSON.stringify(res.body, null, 2));

    expect(res.body).toEqual([
      {
        id: expect.any(Number),
        num: "A100",
        sellto_customer_name: "Cliente Test",
        jmt_status: "ENVIADO",
        furniture_load_date_jmt: "2025-10-23T10:00:00.000Z",
        jmteventname: "Evento Test",
        lineas: [],
      }
    ]);
  });
});
