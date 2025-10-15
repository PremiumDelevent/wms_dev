class ModifyOrderUseCase {
    constructor({ ordersRepository }) {
      this.ordersRepository = ordersRepository;
    }

    async execute(order) {
      return this.ordersRepository.updateOrder(order);
    }
}

module.exports = ModifyOrderUseCase;