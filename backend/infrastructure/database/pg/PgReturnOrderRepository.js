const ReturnOrderRepository = require("../../../domain/ports/ReturnOrderRepository");

class PgReturnOrderRepository extends ReturnOrderRepository {
  constructor({ pool }) {
    super();
    this.pool = pool;
  }

  // items: [{ productId, qty }]
  async bulkIncreaseStock(items) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      for (const it of items) {
        const qty = Number(it.qty) || 0;
        const id = String(it.productId || "");
        if (!id) continue;
        await client.query(
          "UPDATE products SET stock = stock + $1 WHERE id = $2",
          [qty, id]
        );
      }

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = PgReturnOrderRepository;