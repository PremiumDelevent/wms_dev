const IncidentsRepository = require("../../../../domain/ports/Incidents/IncidentsRepository");
const Incident = require("../../../../domain/entities/Incident");

class PgIncidentsRepository extends IncidentsRepository {
    constructor({ pool }) {
        super();
        this.pool = pool;
    }

    async listAll() {   

        const {rows} = await this.pool.query(
            "SELECT id, num, sellto_customer_name, furniture_load_date_jmt, jmt_status, jmteventname, lineas FROM incidents ORDER BY furniture_load_date_jmt DESC"
        );

        return rows.map(
            (r) => 
                new Incident({
                    id: r.id,
                    num: r.num,
                    sellto_customer_name: r.sellto_customer_name,
                    furniture_load_date_jmt: r.furniture_load_date_jmt,
                    jmt_status: r.jmt_status,
                    jmteventname: r.jmteventname,
                    lineas: r.lineas
                })
        );
    }

    async setIncident(incident) {

        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(
              `INSERT INTO incidents (num, sellto_customer_name, furniture_load_date_jmt, jmt_status, jmteventname, lineas) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                ON CONFLICT (num)
                DO UPDATE SET
                    sellto_customer_name = EXCLUDED.sellto_customer_name,
                    furniture_load_date_jmt = EXCLUDED.furniture_load_date_jmt,
                    jmt_status = $4,
                    jmteventname = EXCLUDED.jmteventname,
                    lineas = EXCLUDED.lineas`,
              [
                incident.num,
                incident.sellto_customer_name,
                incident.furniture_load_date_jmt,
                'INCIDENCIA',
                incident.jmteventname,
                JSON.stringify(incident.lineas),
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

    async deleteIncident(num) {
        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(
                `DELETE FROM incidents WHERE num = $1`,
                [num]
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

module.exports = PgIncidentsRepository;