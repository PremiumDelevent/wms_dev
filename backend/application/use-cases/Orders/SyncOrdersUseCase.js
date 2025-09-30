async function SyncOrdersUseCase({ ordersRepository, businessCentralOrdersService }) {
  console.log("🔄 [SYNC] Starting order synchronization...");

  const externalOrders = await businessCentralOrdersService.fetchOrders();

  for (const extOrder of externalOrders) {
    await ordersRepository.save(extOrder);
  }

  console.log(`✅ [SYNC] ${externalOrders.length} orders synchronized.`);
}

module.exports = SyncOrdersUseCase;