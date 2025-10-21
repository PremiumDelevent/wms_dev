const express = require("express");
const request = require("supertest");
const { newDb } = require("pg-mem");
const createReturnStatusRouter = require("../../../infrastructure/api/http/routes/Orders/return-status.routes");
const logger = require("../../../infrastructure/logger/logger");

describe("/api/return-status", () => {
  let app, pool;

  beforeAll(async () => {
    logger.info("Inicializando base de datos en memoria para tests");

    const db = newDb();
    db.public.none(`
      CREATE TABLE orders (id SERIAL PRIMARY KEY, num VARCHAR(50), jmt_status VARCHAR(50));
      INSERT INTO orders (num, jmt_status) VALUES ('A100', 'ENVIADO');
    `);

    pool = new (db.adapters.createPg().Pool)();

    app = express();
    app.use(express.json());
    app.use("/api", createReturnStatusRouter({ pool }));

    logger.debug("Router de /api/return-status montado correctamente");
  });

  afterAll(async () => {
    logger.info("Cerrando pool de base de datos");
    await pool.end();
  });

  test("✅ actualiza status a DEVUELTO y devuelve 200", async () => {
    logger.info("Test: actualizar status a DEVUELTO");

    const { rows } = await pool.query("SELECT id FROM orders WHERE num='A100'");
    const orderId = rows[0].id;
    logger.debug("ID del pedido encontrado:" + orderId);

    const res = await request(app)
      .post("/api/return-status")
      .send({ orderId })
      .expect(200);

    logger.info("Respuesta recibida:" + res.body.message);

    const { rows: updated } = await pool.query("SELECT jmt_status FROM orders WHERE id=$1", [orderId]);
    logger.debug("Estado actualizado en DB:" + updated[0].jmt_status);

    expect(updated[0].jmt_status).toBe("DEVUELTO");
  });

  test("❌ devuelve 500 si el ID no existe", async () => {
    logger.info("Test: error al actualizar status con ID inexistente");

    try {
    const res = await request(app)
        .post("/api/return-status")
        .send({ orderId: 999 })
        .expect(500);

    logger.debug("Respuesta esperada de error:", res.body.message);
    } catch (err) {
    logger.error("Error inesperado en test de fallo:", err);
    throw err;
    }
  });
});
