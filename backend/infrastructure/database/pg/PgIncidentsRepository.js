const IncidentsRepository = require("../../../domain/ports/IncidentsRepository");
const Incident = require("../../../domain/entities/Incident");

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
}

module.exports = PgIncidentsRepository;