const SyncExchangesUseCase = require("../../application/use-cases/Exchanges/SyncExchangesUseCase");

class ExchangesSyncScheduler {
  constructor({ exchangesRepository, businessCentralExchangesService }) {
    this.exchangesRepository = exchangesRepository;
    this.businessCentralExchangesService = businessCentralExchangesService;
  }

  start() {
    // Run immediately on start
    this.runSync();

    // Repeat every 30 minutes
    setInterval(() => {
      this.runSync();
    }, 30 * 60 * 1000);
  }

  async runSync() {
    try {
      await SyncExchangesUseCase({
        exchangesRepository: this.exchangesRepository,
        businessCentralExchangesService: this.businessCentralExchangesService
      });
    } catch (err) {
      console.error("❌ [SYNC] Error during synchronization:", err.message);
    }
  }
}

module.exports = ExchangesSyncScheduler;