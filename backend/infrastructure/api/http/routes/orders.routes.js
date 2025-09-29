const express = require("express");
const PgOrdersRepository = require("../../../database/pg/PgOrdersRepository");
const ListOrdersUseCase = require("../../../../application/use-cases/ListOrdersUseCase");

function createOrdersRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const ordersRepository = new PgOrdersRepository({ pool });
  const listOrdersUseCase = new ListOrdersUseCase({ ordersRepository });

  // GET /api/orders-db
  router.get("/orders-db", async (_req, res) => {
    try {
      const orders = await listOrdersUseCase.execute();
      res.json(orders);
    } catch (error) {
      console.error("❌ Error obteniendo orders desde DB (hex):", error.message);
      res
        .status(500)
        .json({ error: "Error obteniendo orders desde la base de datos" });
    }
  });

  return router;
}

module.exports = createOrdersRouter;