const SyncOrdersUseCase = require("../../application/use-cases/SyncOrdersUseCase");

class OrdersSyncScheduler {
  constructor({ ordersRepository, businessCentralOrdersService }) {
    this.ordersRepository = ordersRepository;
    this.businessCentralOrdersService = businessCentralOrdersService;
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
      await SyncOrdersUseCase({
        ordersRepository: this.ordersRepository,
        businessCentralOrdersService: this.businessCentralOrdersService
      });
    } catch (err) {
      console.error("❌ [SYNC] Error during synchronization:", err.message);
    }
  }
}

module.exports = OrdersSyncScheduler;