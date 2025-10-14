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
      
      return res.status(200).json({ 
        success: true,
        message: 'Pallet creado correctamente' 
      });
  
    } catch (error) {
      console.error("❌ Error insertando pallet en BD:", error);
      
      return res.status(500).json({ 
        success: false,
        message: error.message || 'Error al crear el pallet' 
      });
    }
  });

  return router;
}

module.exports = createSetPalletsRouter;