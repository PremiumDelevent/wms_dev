const ProductRepository = require("../../../../domain/ports/Products/ProductRepository");
const Product = require("../../../../domain/entities/Product");

class PgProductRepository extends ProductRepository {
  constructor({ pool }) {
    super();
    this.pool = pool;
  }

  async listAll() {

    const { rows } = await this.pool.query(
      "SELECT id, name, category, stock FROM products ORDER BY id ASC"
    );
    
    return rows.map(
      (r) =>
        new Product({
          id: r.id,
          name: r.name,
          category: r.category,
          stock: r.stock,
        })
    );
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

  async save(product) {
    await this.pool.query(
      `INSERT INTO products (id, name, category, stock)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id)
      DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category`,
      [product.id, product.name, product.category, 0]
    );
  }
}

module.exports = PgProductRepository;