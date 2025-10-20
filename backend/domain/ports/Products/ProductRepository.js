class ProductRepository {
    // Debe retornar una lista de entidades Product
    async listAll() {
      throw new Error("Not implemented");
    }

    // items: [{ productId, qty }]
    async bulkDecreaseStock(items) {
      throw new Error("Not implemented");
    }

    // items: [{ productId, qty }]
    async bulkIncreaseStock(items) {
      throw new Error("Not implemented");
    }

    // items: [{ productId, qty }]
    async bulkIncreaseAvailable(items) {
      throw new Error("Not implemented");
    }

    async save(product) {
      throw new Error("Not implemented");
    }
}
  
module.exports = ProductRepository;