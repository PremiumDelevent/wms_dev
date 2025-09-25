class ListOrdersUseCase {
    constructor({ ordersRepository }) {
      this.ordersRepository = ordersRepository;
    }
  
    async execute() {
      return this.ordersRepository.listAll();
    }
}

module.exports = ListOrdersUseCase;