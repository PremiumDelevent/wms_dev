const express = require("express");
const PgShipStatusRepository = require("../../../database/pg/Orders/PgShipStatusRepository");
const ShipStatusUseCase = require("../../../../application/use-cases/ShipStatusUseCase");

// POST /api/ship-status

function createShipStatusRouter({ pool }) {
  const router = express.Router();

  router.post("/ship-status", async (req, res) => {
    try {
      const shipStatusRepository = new PgShipStatusRepository({ pool });
      const useCase = new ShipStatusUseCase({ shipStatusRepository });
      const { orderId } = req.body;

      const result = await useCase.execute(orderId);

      res.status(200).json({
        message: "✅ Status actualizado correctamente",
        ...result,
      });
  } catch (err) {
    console.error("❌ Error procesando status:", err.message);
    res.status(500).json({
      message: "❌ Error procesando status",
      error: err.message,
    });
  }
});

  return router;
} 

module.exports = createShipStatusRouter;
