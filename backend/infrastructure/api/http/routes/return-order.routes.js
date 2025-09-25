const express = require("express");
const PgReturnOrderRepository = require("../../../database/pg/PgReturnOrderRepository");
const ReturnOrderUseCase = require("../../../../application/use-cases/ReturnOrderUseCase");

// POST /api/return-order

function createReturnOrderRouter({ pool }) {
  const router = express.Router();

  router.post("/return-order", async (req, res) => {
    try {
      const returnOrderRepository = new PgReturnOrderRepository({ pool });
      const useCase = new ReturnOrderUseCase({ returnOrderRepository });

    const result = await useCase.execute(req.body);

    res.status(200).json({
      message: "✅ Stock actualizado correctamente",
      ...result,
    });
  } catch (err) {
    console.error("❌ Error procesando entrada de productos (hex):", err.message);
    res.status(500).json({
      message: "❌ Error procesando entrada de productos",
      error: err.message,
    });
  }});

  return router;
} 

module.exports = createReturnOrderRouter; 
