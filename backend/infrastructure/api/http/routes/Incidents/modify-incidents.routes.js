const express = require("express");
const PgIncidentsRepository = require("../../../../database/pg/Incidents/PgIncidentsRepository");
const ModifyIncidentsUseCase = require("../../../../../application/use-cases/Incidents/ModifyIncidentsUseCase");

function createModifyIncidentsRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const incidentsRepository = new PgIncidentsRepository({ pool });
  const modifyIncidentsUseCase = new ModifyIncidentsUseCase({ incidentsRepository });

  // POST /api/set-incidents-db
  router.post("/modify-incidents-db", async (req, res) => {
    try {
      const incidentData = req.body;
  
      await modifyIncidentsUseCase.execute(incidentData);
  
    } catch (error) {
      console.error("❌ Error insertando incident en BD:", error);
    }
  });

  return router;
}

module.exports = createModifyIncidentsRouter;