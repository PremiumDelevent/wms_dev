const express = require("express");
const PgProductRepository = require("../../../../database/pg/Products/PgProductRepository");
const ListProductsUseCase = require("../../../../../application/use-cases/Products/ListProductsUseCase");

function createProductsRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const productRepository = new PgProductRepository({ pool });
  const listProductsUseCase = new ListProductsUseCase({ productRepository });

  // GET /api/products-db
  router.get("/products-db", async (_req, res) => {
    try {
      const products = await listProductsUseCase.execute();
      res.json(products);
    } catch (error) {
      console.error("❌ Error obteniendo productos desde DB (hex):", error.message);
      res
        .status(500)
        .json({ error: "Error obteniendo productos desde la base de datos" });
    }
  });

  return router;
}

module.exports = createProductsRouter;
