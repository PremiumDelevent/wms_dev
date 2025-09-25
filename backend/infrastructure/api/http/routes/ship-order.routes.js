const express = require("express");
const PgShipOrderRepository = require("../../../database/pg/PgShipOrderRepository");
const ShipOrderUseCase = require("../../../../application/use-cases/ShipOrderUseCase");

// POST /api/ship-order

function createShipOrderRouter({ pool }) {
  const router = express.Router();

  router.post("/ship-order", async (req, res) => {
    try {
      const shipOrderRepository = new PgShipOrderRepository({ pool });
      const useCase = new ShipOrderUseCase({ shipOrderRepository });

    const result = await useCase.execute(req.body);

    res.status(200).json({
      message: "✅ Stock actualizado correctamente",
      ...result,
    });
  } catch (err) {
    console.error("❌ Error procesando entrada de productos (hex):", err.message);
    res.status(500).json({
      message: "❌ Error procesando entrada de productos",
      error: err.message,
    });
  }
});

  return router;
} 

module.exports = createShipOrderRouter;
