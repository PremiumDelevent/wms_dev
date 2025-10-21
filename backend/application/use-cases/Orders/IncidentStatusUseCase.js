class IncidentStatusUseCase {
    constructor({ ordersRepository }) {
      this.ordersRepository = ordersRepository;
    }

    async execute(id) {
      return this.ordersRepository.updateStatusIncident(id);
    }
}

module.exports = IncidentStatusUseCase;