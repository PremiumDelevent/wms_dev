class ShipStatusUseCase {
    constructor({ ordersRepository }) {
      this.ordersRepository = ordersRepository;
    }

    async execute(id) {
      return this.ordersRepository.updateStatusShip(id);
    }
}

module.exports = ShipStatusUseCase;