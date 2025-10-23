const express = require("express");
const request = require("supertest");
const createHelloRouter = require("../../../../infrastructure/api/http/routes/Hello/hello.routes");
const logger = require("../../../../infrastructure/logger/logger");

describe("/api/hello", () => {
  let app;

  beforeAll(() => {
    logger.info("Inicializando app de Express para tests de /hello");

    app = express();
    app.use(express.json());
    app.use("/api", createHelloRouter());

    logger.debug("Router de /api/hello montado correctamente");
  });

  afterAll(() => {
    logger.info("Finalizando tests de /hello");
  });

  test("✅ responde con 'Hello, World!' y status 200", async () => {
    logger.info("Test: llamada GET a /api/hello");

    const res = await request(app)
      .get("/api/hello")
      .expect(200);

    logger.info("Respuesta recibida: " + JSON.stringify(res.body));

    expect(res.body).toEqual({ message: "Hello, World!" });
  });
});
