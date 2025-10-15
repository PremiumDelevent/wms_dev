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
            
            const result = await client.query(
              `INSERT INTO pallets (
                sellto_customer_name, 
                furniture_load_date_jmt, 
                jmt_status, 
                jmteventname, 
                lineas
              ) 
              VALUES ($1, $2, $3, $4, $5)
              RETURNING *`,
              [
                pallet.sellto_customer_name,
                pallet.furniture_load_date_jmt,
                'A PREPARAR',
                pallet.jmteventname,
                JSON.stringify(pallet.lineas),
              ]
            );
      
            await client.query("COMMIT");
            
            // Devolver el pallet creado
            return result.rows[0];
            
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = PgPalletsRepository;