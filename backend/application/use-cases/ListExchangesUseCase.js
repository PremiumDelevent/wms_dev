class ListExchangesUseCase {
    constructor({ exchangesRepository }) {
      this.exchangesRepository = exchangesRepository;
    }
  
    async execute() {
      return this.exchangesRepository.listAll();
    }
}

module.exports = ListExchangesUseCase;