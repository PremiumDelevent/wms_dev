const express = require("express");
const request = require("supertest");
const { newDb } = require("pg-mem");
const createSetIncidentsRouter = require("../../../../infrastructure/api/http/routes/Incidents/set-incidents.routes");
const logger = require("../../../../infrastructure/logger/logger");

describe("/api/set-incidents-db", () => {
  let app, pool;

  beforeAll(async () => {
    logger.info("Inicializando base de datos en memoria para tests de setIncident");

    // Base de datos simulada
    const db = newDb();
    db.public.none(`
      CREATE TABLE incidents (
        id SERIAL PRIMARY KEY,
        num VARCHAR(50) UNIQUE NOT NULL,
        sellto_customer_name TEXT,
        furniture_load_date_jmt TIMESTAMP NULL,
        jmt_status VARCHAR(50),
        jmteventname VARCHAR(255),
        lineas JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );

      INSERT INTO incidents (num, sellto_customer_name, furniture_load_date_jmt, jmt_status, jmteventname, lineas)
      VALUES ('A100', 'Cliente Inicial', '2025-10-22 10:00:00', 'ENVIADO', 'Evento Inicial', '[]');
    `);

    pool = new (db.adapters.createPg().Pool)();

    // App y router
    app = express();
    app.use(express.json());
    app.use("/api", createSetIncidentsRouter({ pool }));

    logger.debug("Router de /api/set-incidents-db montado correctamente");
  });

  afterAll(async () => {
    logger.info("Cerrando pool de base de datos");
    await pool.end();
  });

  // ============================================================
  // 1️⃣ Caso: Inserta un nuevo incidente (num nuevo)
  // ============================================================
  test("✅ Inserta un nuevo incidente correctamente cuando num no existe", async () => {
    logger.info("Test: Insertar nuevo incidente");

    const newIncident = {
      num: "B200",
      sellto_customer_name: "Nuevo Cliente",
      furniture_load_date_jmt: "2025-10-23T09:30:00Z",
      jmteventname: "Nuevo Evento",
      lineas: [{ item: "Mesa", qty: 2 }]
    };

    const res = await request(app)
      .post("/api/set-incidents-db")
      .send(newIncident)
      .expect(200);

    // Verificamos que se haya insertado correctamente
    const { rows } = await pool.query("SELECT * FROM incidents WHERE num = 'B200'");
    expect(rows).toHaveLength(1);

    const inserted = rows[0];
    expect(inserted.sellto_customer_name).toBe("Nuevo Cliente");
    expect(inserted.jmt_status).toBe("INCIDENCIA"); // se fuerza a este valor
    expect(inserted.jmteventname).toBe("Nuevo Evento");
    expect(inserted.lineas).toEqual([{ item: "Mesa", qty: 2 }]);
  });

  // ============================================================
  // 2️⃣ Caso: Actualiza un incidente existente (num ya existe)
  // ============================================================
  test("✅ Actualiza un incidente existente correctamente cuando num ya existe", async () => {
    logger.info("Test: Actualizar incidente existente");

    const updatedIncident = {
      num: "A100", // ya existe
      sellto_customer_name: "Cliente Actualizado",
      furniture_load_date_jmt: "2025-10-24T08:00:00Z",
      jmteventname: "Evento Actualizado",
      lineas: [{ item: "Silla", qty: 4 }]
    };

    await request(app)
      .post("/api/set-incidents-db")
      .send(updatedIncident)
      .expect(200);

    // Comprobamos actualización
    const { rows } = await pool.query("SELECT * FROM incidents WHERE num = 'A100'");
    expect(rows).toHaveLength(1);

    const updated = rows[0];
    expect(updated.sellto_customer_name).toBe("Cliente Actualizado");
    expect(updated.jmt_status).toBe("INCIDENCIA"); // siempre se sobreescribe
    expect(updated.jmteventname).toBe("Evento Actualizado");
    expect(updated.lineas).toEqual([{ item: "Silla", qty: 4 }]);
  });
});
