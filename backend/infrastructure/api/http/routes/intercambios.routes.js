const express = require("express");
const PgIntercambiosRepository = require("../../../database/pg/PgIntercambiosRepository");
const ListIntercambiosUseCase = require("../../../../application/use-cases/ListIntercambiosUseCase");

function createIntercambiosRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const intercambiosRepository = new PgIntercambiosRepository({ pool });
  const listIntercambiosUseCase = new ListIntercambiosUseCase({ intercambiosRepository });

  // GET /api/intercambios-db
  router.get("/intercambios-db", async (_req, res) => {
    try {
      const intercambios = await listIntercambiosUseCase.execute();
      res.json(intercambios);
    } catch (error) {
      console.error("❌ Error obteniendo intercambios desde DB (hex):", error.message);
      res
        .status(500)
        .json({ error: "Error obteniendo intercambios desde la base de datos" });
    }
  });

  return router;
}

module.exports = createIntercambiosRouter;
