const express = require("express");
const request = require("supertest");
const { newDb } = require("pg-mem");
const createModifyOrderRouter = require("../../../../infrastructure/api/http/routes/Orders/modify-order.routes");
const logger = require("../../../../infrastructure/logger/logger");

describe("/api/modify-order-db", () => {
  let app, pool;

  beforeAll(async () => {
    logger.info("Inicializando base de datos en memoria para tests");

    const db = newDb();
    db.public.none(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        num VARCHAR(50) UNIQUE NOT NULL,         -- Número de pedido en BC
        sellto_customer_name TEXT,               -- Cliente
        furniture_load_date_jmt TIMESTAMP NULL,  -- Fecha de carga
        jmt_status VARCHAR(50),                  -- Estado
        lineas JSONB NOT NULL DEFAULT '[]',      -- Array JSON con artículos
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        jmtEventName VARCHAR(255)
    );

      INSERT INTO orders (num, sellto_customer_name, furniture_load_date_jmt, jmt_status, lineas, updated_at)
      VALUES (
        'A100',
        'Cliente 1',
        '2025-10-22 12:55:00',
        'ENVIADO',
        '[{"producto_id":"P001","descripcion":"Producto 1","cantidad":2},{"producto_id":"P002","descripcion":"Producto 2","cantidad":5}]',
        '2025-10-22 12:55:00'
      );
    `);

    pool = new (db.adapters.createPg().Pool)();

    app = express();
    app.use(express.json());
    app.use("/api", createModifyOrderRouter({ pool }));

    logger.debug("Router de /api/modify-order-db montado correctamente");
  });

  afterAll(async () => {
    logger.info("Cerrando pool de base de datos");
    await pool.end();
  });

  
  test("✅ modifyOrder modifica la cantidad de una linea y devuelve 200", async () => {
    logger.info("Test: modificar cantidad de lineas en order A100");

    // Obtenemos ID y lineas del pedido
    const { rows } = await pool.query("SELECT id, lineas FROM orders WHERE num='A100'");
    const orderId = rows[0].id;
    const originalLineas = rows[0].lineas; // Ya es objeto, no JSON.parse

    logger.debug("ID del pedido encontrado: " + orderId);
    logger.debug("Lineas iniciales: " + JSON.stringify(originalLineas));
    
    // Modificamos la cantidad del producto P001
    const modifiedLineas = originalLineas.map(l =>
      l.producto_id === "P001" ? { ...l, cantidad: 10 } : l
    );
    logger.debug("Lineas modificadas: " + JSON.stringify(modifiedLineas));
    
    // Petición POST a /modify-order-db
    const res = await request(app)
      .post("/api/modify-order-db")
      .send({ num: "A100", lineas: modifiedLineas })
      .expect(200); // Solo validamos que devuelve 200
    
    logger.info("Status recibido: " + res.status);
    logger.info("Mensaje recibido (puede ser undefined): " + res.body.message);

    // Comprobamos que la DB se ha actualizado correctamente
    const { rows: updated } = await pool.query("SELECT lineas FROM orders WHERE id=$1", [orderId]);
    const lineasActualizadas = updated[0].lineas;

    logger.debug("Lineas actualizadas en DB: " + JSON.stringify(lineasActualizadas));

    expect(lineasActualizadas).toEqual(modifiedLineas); // Validamos cambios en la DB
  });
});
