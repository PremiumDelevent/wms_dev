class OrdersRepository {
  
  // Must return a list of entities Orders
  async listAll() {
      throw new Error("Not implemented");
  }

  // Must save an entity Orders
  async save(order) {
    throw new Error("Method not implemented");
  }

  // Must update an entity Orders
  async updateOrder(order) {
    throw new Error("Method not implemented");
  }
}

module.exports = OrdersRepository;