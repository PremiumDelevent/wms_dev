const PalletsRepository = require("../../../../domain/ports/Pallets/PalletsRepository");
const Pallet = require("../../../../domain/entities/Pallet");

class PgPalletsRepository extends PalletsRepository {
    constructor({ pool }) {
        super();
        this.pool = pool;
    }

    async setPallet(pallet) {

        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(
              `INSERT INTO pallets (num, sellto_customer_name, furniture_load_date_jmt, jmt_status, jmteventname, lineas) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                ON CONFLICT (num)
                DO UPDATE SET
                    sellto_customer_name = EXCLUDED.sellto_customer_name,
                    furniture_load_date_jmt = EXCLUDED.furniture_load_date_jmt,
                    jmt_status = $4,
                    jmteventname = EXCLUDED.jmteventname,
                    lineas = EXCLUDED.lineas`,
              [
                pallet.num,
                pallet.sellto_customer_name,
                pallet.furniture_load_date_jmt,
                'A PREPARAR',
                pallet.jmteventname,
                JSON.stringify(pallet.lineas),
              ]
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

module.exports = PgPalletsRepository;