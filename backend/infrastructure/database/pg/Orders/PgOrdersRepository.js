const OrdersRepository = require("../../../../domain/ports/Orders/OrdersRepository");
const Order = require("../../../../domain/entities/Order");

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
                new Order({
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

    async save(order) {
        await this.pool.query(
            `INSERT INTO orders (num, sellto_customer_name, furniture_load_date_jmt, jmtEventName, lineas, updated_at)
            VALUES ($1, $2, $3, $4, $5, now())
            ON CONFLICT (num)
            DO UPDATE SET sellto_customer_name = EXCLUDED.sellto_customer_name,
                            furniture_load_date_jmt = EXCLUDED.furniture_load_date_jmt,
                            jmtEventName = EXCLUDED.jmtEventName,
                            lineas = EXCLUDED.lineas,
                            updated_at = now()`,
            [
                order.num,
                order.sellto_customer_name,
                order.furniture_load_date_jmt,
                order.jmteventname,
                JSON.stringify(order.lineas)
            ]
        );
    }

    async updateOrder(order) {
        await this.pool.query(
            `UPDATE orders SET lineas = $1, updated_at = now()
            WHERE num = $2`,
            [
                JSON.stringify(order.lineas),
                order.num
            ]
        );
    }

    async updateStatusIncident(id) {
        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");
            const result = await client.query(
            "UPDATE orders SET jmt_status = 'INCIDENCIA' WHERE id = $1 RETURNING *",
            [id]
            );
            if (result.rowCount === 0) {
            throw new Error(`Order with id ${id} not found`);
            }
            await client.query("COMMIT");
            return result.rows[0];
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    }

    async updateStatusReturn(id) {
        const client = await this.pool.connect();
        try {
        await client.query("BEGIN");
        const result = await client.query(
            "UPDATE orders SET jmt_status = 'DEVUELTO' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            throw new Error(`Order with id ${id} not found`);
        }

        await client.query("COMMIT");
        return result.rows[0];
        } catch (e) {
        await client.query("ROLLBACK");
        throw e;
        } finally {
        client.release();
        }
    }

    async updateStatusShip  (id) {
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

module.exports = PgOrdersRepository;