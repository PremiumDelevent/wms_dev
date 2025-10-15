const express = require("express");
const PgPalletsRepository = require("../../../../database/pg/Pallets/PgPalletsRepository");
const ListOnePalletUseCase = require("../../../../../application/use-cases/Pallets/ListOnePalletUseCase");

function createListOnePalletRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const palletsRepository = new PgPalletsRepository({ pool });
  const listOnePalletUseCase = new ListOnePalletUseCase({ palletsRepository });

  // GET /api/pallets-db/:id
  router.get("/pallets-db/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const pallets = await listOnePalletUseCase.execute(id);
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

module.exports = createListOnePalletRouter;