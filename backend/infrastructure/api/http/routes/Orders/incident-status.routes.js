const express = require("express");
const PgOrdersRepository = require("../../../../database/pg/Orders/PgOrdersRepository");
const IncidentStatusUseCase = require("../../../../../application/use-cases/Orders/IncidentStatusUseCase");
const logger = require("../../../../logger/logger");

// POST /api/incident-status

function createIncidentStatusRouter({ pool }) {
  const router = express.Router();

  router.post("/incident-status", async (req, res) => {
    try {
      const ordersRepository = new PgOrdersRepository({ pool });
      const useCase = new IncidentStatusUseCase({ ordersRepository });
      const { orderId } = req.body;

      const result = await useCase.execute(orderId);

      res.status(200).json({
        message: "✅ Status actualizado correctamente",
        ...result,
      });
  } catch (err) {
      if (err.message.includes("not found")) {
        // Esto es esperado por los tests → WARN
        logger.debug(`Pedido no encontrado: ${err.message}`);
      } else {
        // Esto sí es un error real
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

module.exports = createIncidentStatusRouter;
