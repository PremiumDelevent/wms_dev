async function SyncProductsUseCase({ productRepository, businessCentralProductsService }) {
    console.log("🔄 [SYNC] Starting products synchronization...");
  
    const externalProducts = await businessCentralProductsService.fetchProducts();
  
    for (const extProduct of externalProducts) {
      await productRepository.save(extProduct);
    }
  
    console.log(`✅ [SYNC] ${externalProducts.length} products synchronized.`);
  }
  
  module.exports = SyncProductsUseCase;