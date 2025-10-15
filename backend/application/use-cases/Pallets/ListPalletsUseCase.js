class ListPalletsUseCase {
    constructor({ palletsRepository }) {
      this.palletsRepository = palletsRepository;
    }
  
    async execute() {
      return this.palletsRepository.listPallets();
    }
  }
  
  module.exports = ListPalletsUseCase;
  