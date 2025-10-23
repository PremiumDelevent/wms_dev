const express = require("express");
const request = require("supertest");
const { newDb } = require("pg-mem");
const createModifyIncidentsRouter = require("../../../../infrastructure/api/http/routes/Incidents/modify-incidents.routes");
const logger = require("../../../../infrastructure/logger/logger");

describe("/api/modify-incidents-db", () => {
  let app, pool;

  beforeAll(async () => {
    logger.info("Inicializando base de datos en memoria para tests de modify-incidents");

    const db = newDb();
    db.public.none(`
      CREATE TABLE incidents (
        id SERIAL PRIMARY KEY,
        num VARCHAR(50) UNIQUE NOT NULL,
        sellto_customer_name VARCHAR(255),
        furniture_load_date_jmt TIMESTAMP,
        jmt_status VARCHAR(50),
        jmteventname VARCHAR(255),
        lineas JSONB
      );
    `);

    pool = new (db.adapters.createPg().Pool)();
    
    app = express();
    app.use(express.json());
    app.use("/api", createModifyIncidentsRouter({ pool }));

    // Insertamos un registro inicial
    await pool.query(`
      INSERT INTO incidents (num, sellto_customer_name, furniture_load_date_jmt, jmt_status, jmteventname, lineas)
      VALUES ('INC123', 'Cliente Uno', '2025-10-23T09:30:00Z', 'PENDIENTE', 'Evento Original', '[]');
    `);
  });

  it("debería modificar correctamente el incident existente", async () => {
    const modifiedIncident = {
      num: "INC123",
      lineas: [{ producto: "Silla", cantidad: 4 }],
    };

    const response = await request(app)
      .post("/api/modify-incidents-db")
      .send(modifiedIncident);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Incident modificado correctamente");

    // Comprobamos que se modificó en la BD
    const { rows } = await pool.query("SELECT * FROM incidents WHERE num = 'INC123'");
    expect(rows[0].lineas).toEqual([{ producto: "Silla", cantidad: 4 }]);
  });
});
