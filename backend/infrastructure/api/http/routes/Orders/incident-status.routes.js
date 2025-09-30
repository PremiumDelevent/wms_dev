const express = require("express");
const PgIncidentStatusRepository = require("../../../../database/pg/Incidents/PgIncidentStatusRepository");
const IncidentStatusUseCase = require("../../../../../application/use-cases/IncidentStatusUseCase");

// POST /api/incident-status

function createIncidentStatusRouter({ pool }) {
  const router = express.Router();

  router.post("/incident-status", async (req, res) => {
    try {
      const incidentStatusRepository = new PgIncidentStatusRepository({ pool });
      const useCase = new IncidentStatusUseCase({ incidentStatusRepository });
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

module.exports = createIncidentStatusRouter;
