class ListIntercambiosUseCase {
    constructor({ intercambiosRepository }) {
      this.intercambiosRepository = intercambiosRepository;
    }
  
    async execute() {
      return this.intercambiosRepository.listAll();
    }
}

module.exports = ListIntercambiosUseCase;