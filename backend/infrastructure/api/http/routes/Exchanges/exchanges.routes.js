const express = require("express");
const PgExchangesRepository = require("../../../../database/pg/Exchanges/PgExchangesRepository");
const ListExchangesUseCase = require("../../../../../application/use-cases/ListExchangesUseCase");

function createExchangeRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const exchangesRepository = new PgExchangesRepository({ pool });
  const listExchangesUseCase = new ListExchangesUseCase({ exchangesRepository });

  // GET /api/exchanges-db
  router.get("/exchanges-db", async (_req, res) => {
    try {
      const exchanges = await listExchangesUseCase.execute();
      res.json(exchanges);
    } catch (error) {
      console.error("❌ Error obteniendo exchanges desde DB (hex):", error.message);
      res
        .status(500)
        .json({ error: "Error obteniendo exchanges desde la base de datos" });
    }
  });

  return router;
}

module.exports = createExchangeRouter;
