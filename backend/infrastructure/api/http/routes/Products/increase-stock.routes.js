const express = require("express");
const PgProductRepository = require("../../../../database/pg/Products/PgProductRepository");
const IncreaseStockUseCase = require("../../../../../application/use-cases/Products/IncreaseStockUseCase");

// POST /api/increase-stock

function createIncreaseStockRouter({ pool }) {
  const router = express.Router();

  router.post("/increase-stock", async (req, res) => {
    try {
      const productRepository = new PgProductRepository({ pool });
      const useCase = new IncreaseStockUseCase({ productRepository });

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

module.exports = createIncreaseStockRouter; 
