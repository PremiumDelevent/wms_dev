class ShipOrderUseCase {
    constructor({ shipOrderRepository }) {
      this.shipOrderRepository = shipOrderRepository;
    }
  
    async execute(payload) {
      if (!payload || !Array.isArray(payload.productos)) {
        throw new Error("Payload inválido: se esperaba { productos: [...] }");
      }
  
      const items = payload.productos
        .filter((p) => p && p.producto_id) // ignora nulos
        .map((p) => ({
          productId: String(p.producto_id),
          qty: Number(p.cantidad) || 0,
        }));
  
      if (items.length === 0) {
        return { updated: 0 };
      }
  
      await this.shipOrderRepository.bulkDecreaseStock(items);
      return { updated: items.length };
    }
  }
  
  module.exports = ShipOrderUseCase;