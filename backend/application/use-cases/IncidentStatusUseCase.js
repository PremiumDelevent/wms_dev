class IncidentStatusUseCase {
    constructor({ incidentStatusRepository }) {
      this.incidentStatusRepository = incidentStatusRepository;
    }

    async execute(id) {
      return this.incidentStatusRepository.updateStatus(id);
    }
}

module.exports = IncidentStatusUseCase;