const express = require("express");
const PgIncidentsRepository = require("../../../../database/pg/Incidents/PgIncidentsRepository");
const ListIncidentsUseCase = require("../../../../../application/use-cases/Incidents/ListIncidentsUseCase");

function createIncidentsRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const incidentsRepository = new PgIncidentsRepository({ pool });
  const listIncidentsUseCase = new ListIncidentsUseCase({ incidentsRepository });

  // GET /api/incidents-db
  router.get("/incidents-db", async (_req, res) => {
    try {
      const incidents = await listIncidentsUseCase.execute();
      res.json(incidents);
    } catch (error) {
      console.error("❌ Error obteniendo incidents desde DB (hex):", error.message);
      res
        .status(500)
        .json({ error: "Error obteniendo incidents desde la base de datos" });
    }
  });

  return router;
}

module.exports = createIncidentsRouter;