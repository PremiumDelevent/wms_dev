const express = require("express");
const PgOrdersRepository = require("../../../../database/pg/Orders/PgOrdersRepository");
const ShipStatusUseCase = require("../../../../../application/use-cases/Orders/ShipStatusUseCase");
const logger = require("../../../../logger/logger");

// POST /api/ship-status

function createShipStatusRouter({ pool }) {
  const router = express.Router();

  router.post("/ship-status", async (req, res) => {
    try {
      const ordersRepository = new PgOrdersRepository({ pool });
      const useCase = new ShipStatusUseCase({ ordersRepository });
      const { orderId } = req.body;

      const result = await useCase.execute(orderId);

      res.status(200).json({
        message: "✅ Status actualizado correctamente",
        ...result,
      });
  } catch (err) {
      if (err.message.includes("not found")) {
        logger.debug(`Pedido no encontrado: ${err.message}`);
      } else {
        logger.error(`Error procesando status: ${err.message}`);
      }
      res.status(500).json({
        message: "❌ Error procesando status",
        error: err.message,
      });
  }
});

  return router;
} 

module.exports = createShipStatusRouter;
