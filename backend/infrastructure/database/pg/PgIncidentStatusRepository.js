const IncidentStatusRepository = require("../../../domain/ports/IncidentStatusRepository");

class PgIncidentStatusRepository extends IncidentStatusRepository {
  constructor({ pool }) {
    super();
    this.pool = pool;
  }

  async updateStatus(id) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE orders SET jmt_status = 'INCIDENCIA' WHERE id = $1",
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

module.exports = PgIncidentStatusRepository;