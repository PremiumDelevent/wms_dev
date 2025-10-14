const express = require("express");
const PgPalletsRepository = require("../../../../database/pg/Pallets/PgPalletsRepository");
const SetPalletsUseCase = require("../../../../../application/use-cases/Pallets/SetPalletsUseCase");

function createSetPalletsRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const palletsRepository = new PgPalletsRepository({ pool });
  const setPalletsUseCase = new SetPalletsUseCase({ palletsRepository });

  // POST /api/set-pallets-db
  router.post("/set-pallets-db", async (req, res) => {
    try {
      const palletData = req.body;
  
      await setPalletsUseCase.execute(palletData);
  
    } catch (error) {
      console.error("❌ Error insertando pallet en BD:", error);
    }
  });

  return router;
}

module.exports = createSetPalletsRouter;