const IntercambiosRepository = require("../../../domain/ports/IntercambiosRepository");
const Exchange = require("../../../domain/entities/Exchange");

class PgIntercambiosRepository extends IntercambiosRepository {
    constructor({ pool }) {
        super();
        this.pool = pool;
    }

    async listAll() {   

        const {rows} = await this.pool.query(
            "SELECT id, documentno, description, location_code, shortcut_dimension_1_code FROM intercambios ORDER BY id ASC"
        );

        return rows.map(
            (r) => 
                new Exchange({
                    id: r.id,
                    documentno: r.documentno,
                    description: r.description,
                    location_code: r.location_code,
                    shortcut_dimension_1_code: r.shortcut_dimension_1_code
                })
        );
    }

    async save(exchange) {
        await this.pool.query(
            `INSERT INTO intercambios (documentno, description, location_code, shortcut_dimension_1_code) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id)
            DO UPDATE SET
                documentno = EXCLUDED.documentno,
                description = EXCLUDED.description,
                location_code = EXCLUDED.location_code,
                shortcut_dimension_1_code = EXCLUDED.shortcut_dimension_1_code`,
            [exchange.documentno || "SIN_DOC", exchange.description , exchange.location_code , exchange.shortcut_dimension_1_code]
        );
    }
}


module.exports = PgIntercambiosRepository;