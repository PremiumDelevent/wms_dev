const express = require("express");
const PgProductRepository = require("../../../../database/pg/Products/PgProductRepository");
const IncreaseAvailableUseCase = require("../../../../../application/use-cases/Products/IncreaseAvailableUseCase");

// POST /api/increase-available

function createIncreaseAvailableRouter({ pool }) {
  const router = express.Router();

  router.post("/increase-available", async (req, res) => {
    try {
      const productRepository = new PgProductRepository({ pool });
      const useCase = new IncreaseAvailableUseCase({ productRepository });

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

module.exports = createIncreaseAvailableRouter; 
