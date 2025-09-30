class ReturnStatusUseCase {
    constructor({ returnStatusRepository }) {
      this.returnStatusRepository = returnStatusRepository;
    }

    async execute(id) {
      return this.returnStatusRepository.updateStatus(id);
    }
}

module.exports = ReturnStatusUseCase;