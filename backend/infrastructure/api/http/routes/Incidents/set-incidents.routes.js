const express = require("express");
const PgIncidentsRepository = require("../../../../database/pg/Incidents/PgIncidentsRepository");
const SetIncidentsUseCase = require("../../../../../application/use-cases/Incidents/SetIncidentsUseCase");

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
  
    } catch (error) {
      console.error("❌ Error insertando incident en BD:", error);
    }
  });

  return router;
}

module.exports = createSetIncidentsRouter;