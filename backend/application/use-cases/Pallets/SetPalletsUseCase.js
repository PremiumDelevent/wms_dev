class SetPalletsUseCase {
    constructor({ palletsRepository }) {
      this.palletsRepository = palletsRepository;
    }
  
    async execute(pallet) {
      return this.palletsRepository.setPallet(pallet);
    }
  }
  
  module.exports = SetPalletsUseCase;
  