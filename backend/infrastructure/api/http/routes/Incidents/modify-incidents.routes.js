const express = require("express");
const PgIncidentsRepository = require("../../../../database/pg/Incidents/PgIncidentsRepository");
const ModifyIncidentsUseCase = require("../../../../../application/use-cases/Incidents/ModifyIncidentsUseCase");
const logger = require("../../../../../infrastructure/logger/logger");

function createModifyIncidentsRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const incidentsRepository = new PgIncidentsRepository({ pool });
  const modifyIncidentsUseCase = new ModifyIncidentsUseCase({ incidentsRepository });

  // POST /api/modify-incidents-db
  router.post("/modify-incidents-db", async (req, res) => {
    try {
      const incidentData = req.body;
      await modifyIncidentsUseCase.execute(incidentData);

      logger.info("✅ Incident modificado correctamente:", incidentData.num);
      res.status(200).json({ message: "Incident modificado correctamente" });
    } catch (error) {
      logger.error("❌ Error modificando incident en BD:", error);
      res.status(500).json({ error: "Error modificando incident en BD" });
    }
  });

  return router;
}

module.exports = createModifyIncidentsRouter;