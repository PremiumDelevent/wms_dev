const ProductRepository = require("../../../domain/ports/ProductRepository");
const Product = require("../../../domain/entities/Product");

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
}

module.exports = PgProductRepository;