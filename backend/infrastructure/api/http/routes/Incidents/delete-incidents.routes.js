const express = require("express");
const PgIncidentsRepository = require("../../../../database/pg/Incidents/PgIncidentsRepository");
const DeleteIncidentsUseCase = require("../../../../../application/use-cases/Incidents/DeleteIncidentsUseCase");

function createDeleteIncidentsRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const incidentsRepository = new PgIncidentsRepository({ pool });
  const deleteIncidentsUseCase = new DeleteIncidentsUseCase({ incidentsRepository });

  // DELETE /api/delete-incidents-db
  router.delete("/delete-incidents-db", async (req, res) => {
    try {
      const {num} = req.body;
      await deleteIncidentsUseCase.execute(num);
      res.status(200).json({
        message: "✅ Incidente eliminado correctamente",
      });
    } catch (error) {
      console.error("❌ Error eliminando incident en BD:", error);
    }
  });

  return router;
}

module.exports = createDeleteIncidentsRouter;