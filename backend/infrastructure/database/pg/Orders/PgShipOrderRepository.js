const ShipOrderRepository = require("../../../../domain/ports/Orders/ShipOrderRepository");

class PgShipOrderRepository extends ShipOrderRepository {
  constructor({ pool }) {
    super();
    this.pool = pool;
  }

  // items: [{ productId, qty }]
  async bulkDecreaseStock(items) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      for (const it of items) {
        const qty = Number(it.qty) || 0;
        const id = String(it.productId || "");
        if (!id) continue;
        await client.query(
          "UPDATE products SET stock = stock - $1 WHERE id = $2",
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

module.exports = PgShipOrderRepository;