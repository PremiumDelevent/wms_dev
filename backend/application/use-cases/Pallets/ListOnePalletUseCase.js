class ListOnePalletUseCase {
    constructor({ palletsRepository }) {
      this.palletsRepository = palletsRepository;
    }
  
    async execute(id) {
      return this.palletsRepository.listOnePallet(id);
    }
  }
  
  module.exports = ListOnePalletUseCase;
  