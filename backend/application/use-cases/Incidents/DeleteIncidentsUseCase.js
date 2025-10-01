class DeleteIncidentsUseCase {
    constructor({ incidentsRepository }) {
      this.incidentsRepository = incidentsRepository;
    }
  
    async execute(num) {
      return this.incidentsRepository.deleteIncident(num);
    }
  }
  
  module.exports = DeleteIncidentsUseCase;
  