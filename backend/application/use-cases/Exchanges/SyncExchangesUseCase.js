async function SyncExchangesUseCase({ exchangesRepository, businessCentralExchangesService }) {
    console.log("🔄 [SYNC] Starting exchanges synchronization...");
  
    const externalExchanges = await businessCentralExchangesService.fetchExchanges();
  
    for (const extExchange of externalExchanges) {
      await exchangesRepository.save(extExchange);
    }
  
    console.log(`✅ [SYNC] ${externalExchanges.length} exchanges synchronized.`);
  }
  
  module.exports = SyncExchangesUseCase;