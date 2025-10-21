class ReturnStatusUseCase {
    constructor({ ordersRepository }) {
      this.ordersRepository = ordersRepository;
    }

    async execute(id) {
      return this.ordersRepository.updateStatusReturn(id);
    }
}

module.exports = ReturnStatusUseCase;