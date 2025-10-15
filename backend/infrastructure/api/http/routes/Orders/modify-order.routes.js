const express = require("express");
const PgOrdersRepository = require("../../../../database/pg/Orders/PgOrdersRepository");
const ModifyOrderUseCase = require("../../../../../application/use-cases/Orders/ModifyOrderUseCase");

function createOrdersRouter({ pool }) {
  const router = express.Router();

  // Composition root local del slice
  const ordersRepository = new PgOrdersRepository({ pool });
  const modifyOrderUseCase = new ModifyOrderUseCase({ ordersRepository });

  // POST /api/modify-order-db
  router.post("/modify-order-db", async (req, res) => {
    try {
      const orders = await modifyOrderUseCase.execute(req.body);
      res.status(200).json({
        message: "✅ Orders actualizado correctamente",
        ...orders,
      });
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