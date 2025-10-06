class ModifyIncidentsUseCase {
    constructor({ incidentsRepository }) {
      this.incidentsRepository = incidentsRepository;
    }
  
    async execute(incident) {
      return this.incidentsRepository.modifyIncident(incident);
    }
  }
  
  module.exports = ModifyIncidentsUseCase;
  