const SyncProductsUseCase = require("../../application/use-cases/Products/SyncProductsUseCase");

class ProductsSyncScheduler {
  constructor({ productRepository, businessCentralProductsService }) {
    this.productRepository = productRepository;
    this.businessCentralProductsService = businessCentralProductsService;
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
      await SyncProductsUseCase({
        productRepository: this.productRepository,
        businessCentralProductsService: this.businessCentralProductsService
      });
    } catch (err) {
      console.error("❌ [SYNC] Error during synchronization:", err.message);
    }
  }
}

module.exports = ProductsSyncScheduler;