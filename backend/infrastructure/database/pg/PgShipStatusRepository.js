const ShipStatusRepository = require("../../../domain/ports/ShipStatusRepository");

class PgShipStatusRepository extends ShipStatusRepository {
  constructor({ pool }) {
    super();
    this.pool = pool;
  }

  async updateStatus(id) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE orders SET jmt_status = 'ENVIADO' WHERE id = $1",
        [id]
      );

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = PgShipStatusRepository;