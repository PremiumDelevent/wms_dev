class ShipStatusUseCase {
    constructor({ shipStatusRepository }) {
      this.shipStatusRepository = shipStatusRepository;
    }

    async execute(id) {
      return this.shipStatusRepository.updateStatus(id);
    }
}

module.exports = ShipStatusUseCase;