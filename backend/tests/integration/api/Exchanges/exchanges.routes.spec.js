const express = require("express");
const request = require("supertest");
const { newDb } = require("pg-mem");
const createExchangesRouter = require("../../../../infrastructure/api/http/routes/Exchanges/exchanges.routes");
const logger = require("../../../../infrastructure/logger/logger");

describe("/api/exchanges-db", () => {
  let pool, app;

  beforeAll(async () => {
    logger.info("Inicializando base de datos en memoria para tests de /exchanges-db");

    const db = newDb();
    db.public.none(`
      CREATE TABLE exchanges (
        id SERIAL PRIMARY KEY,                          -- id autoincremental local
        documentNo VARCHAR(50) NOT NULL,                -- nº documento de BC      
        description TEXT,
        location_code VARCHAR(50),
        shortcut_dimension_1_code VARCHAR(50)
      );

      INSERT INTO exchanges (documentNo, description, location_code, shortcut_dimension_1_code)
      VALUES
        ('DOC001', 'Exchange válido', '3_MAD', 'BCN'),
        ('DOC002', 'Exchange inválido', '2_MAD', 'MAD'),
        ('DOC003', 'Otro válido', '3_SEV', 'BCN');
    `);

    pool = new (db.adapters.createPg().Pool)();

    app = express();
    app.use(express.json());
    app.use("/api", createExchangesRouter({ pool }));

    logger.debug("Router de /api/exchanges-db montado correctamente");
  });

  afterAll(async () => {
    logger.info("Cerrando pool de base de datos (/exchanges-db)");
    await pool.end();
  });

  test("✅ listAll devuelve solo los registros donde SUBSTRING(location_code, 3) <> shortcut_dimension_1_code", async () => {
    logger.info("Ejecutando test: listAll()");

    const res = await request(app)
          .get("/api/exchanges-db")
          .expect(200);
    
    const result = res.body;

    logger.info(`Registros devueltos: ${result.length}`);
    logger.info(JSON.stringify(result));
    
    // Debe devolver solo las filas que NO cumplen la condición (distintas)
    expect(result).toHaveLength(2);

    // Verificamos que los datos correspondan a los inválidos
    const documentnos = result.map(r => r.documentno);
    expect(documentnos).toContain("DOC001");
    expect(documentnos).toContain("DOC003");
  });
});
