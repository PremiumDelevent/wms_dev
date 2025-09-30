const express = require("express");
const PgReturnStatusRepository = require("../../../../database/pg/Orders/PgReturnStatusRepository");
const ReturnStatusUseCase = require("../../../../../application/use-cases/ReturnStatusUseCase");

// POST /api/return-status

function createReturnStatusRouter({ pool }) {
  const router = express.Router();

  router.post("/return-status", async (req, res) => {
    try {
      const returnStatusRepository = new PgReturnStatusRepository({ pool });
      const useCase = new ReturnStatusUseCase({ returnStatusRepository });
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

module.exports = createReturnStatusRouter;
