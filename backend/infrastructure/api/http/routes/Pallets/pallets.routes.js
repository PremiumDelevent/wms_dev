const express = require("express");
const PgPalletsRepository = require("../../../../database/pg/Pallets/PgPalletsRepository");
const ListPalletsUseCase = require("../../../../../application/use-cases/Pallets/ListPalletsUseCase");

function createPalletsRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const palletsRepository = new PgPalletsRepository({ pool });
  const listPalletsUseCase = new ListPalletsUseCase({ palletsRepository });

  // GET /api/pallets-db
  router.get("/pallets-db", async (req, res) => {

    try {
      const pallets = await listPalletsUseCase.execute();
      res.json(pallets);
    } catch (error) {
      console.error("❌ Error obteniendo pallets desde DB (hex):", error.message);
      res
        .status(500)
        .json({ error: "Error obteniendo pallets desde la base de datos" });
    }
  });

  return router;
}

module.exports = createPalletsRouter;