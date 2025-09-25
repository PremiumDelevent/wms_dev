const OrdersRepository = require("../../../domain/ports/OrdersRepository");
const Orders = require("../../../domain/entities/Orders");

class PgOrdersRepository extends OrdersRepository {
    constructor({ pool }) {
        super();
        this.pool = pool;
    }

    async listAll() {   

        const {rows} = await this.pool.query(
            "SELECT id, num, sellto_customer_name, furniture_load_date_jmt, jmt_status, jmteventname, lineas FROM orders ORDER BY furniture_load_date_jmt DESC"
        );

        return rows.map(
            (r) => 
                new Orders({
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

module.exports = PgOrdersRepository;