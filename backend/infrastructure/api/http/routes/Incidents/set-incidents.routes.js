const express = require("express");
const PgIncidentsRepository = require("../../../../database/pg/Incidents/PgIncidentsRepository");
const SetIncidentsUseCase = require("../../../../../application/use-cases/Incidents/SetIncidentsUseCase");
const logger = require("../../../../../infrastructure/logger/logger");

function createSetIncidentsRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const incidentsRepository = new PgIncidentsRepository({ pool });
  const setIncidentsUseCase = new SetIncidentsUseCase({ incidentsRepository });

  // POST /api/set-incidents-db
  router.post("/set-incidents-db", async (req, res) => {
    try {
      const incidentData = req.body;
  
      await setIncidentsUseCase.execute(incidentData);

      res.status(200).json({ message: "Incidente insertado/actualizado correctamente" });
  
    } catch (error) {
      logger.error("❌ Error insertando incident en BD:", error);
      res.status(500).json({ error: "Error insertando incident en BD" });
    }
  });

  return router;
}

module.exports = createSetIncidentsRouter;