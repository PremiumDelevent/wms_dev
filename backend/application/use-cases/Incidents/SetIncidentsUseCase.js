class SetIncidentsUseCase {
    constructor({ incidentsRepository }) {
      this.incidentsRepository = incidentsRepository;
    }
  
    async execute(incident) {
      return this.incidentsRepository.setIncident(incident);
    }
  }
  
  module.exports = SetIncidentsUseCase;
  