class ListIncidentsUseCase {
    constructor({ incidentsRepository }) {
      this.incidentsRepository = incidentsRepository;
    }
  
    async execute() {
      return this.incidentsRepository.listAll();
    }
}

module.exports = ListIncidentsUseCase;