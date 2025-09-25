const IntercambiosRepository = require("../../../domain/ports/IntercambiosRepository");
const Intercambio = require("../../../domain/entities/Intercambios");

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
                new Intercambio({
                    id: r.id,
                    documentno: r.documentno,
                    description: r.description,
                    location_code: r.location_code,
                    shortcut_dimension_1_code: r.shortcut_dimension_1_code
                })
        );
    }
}


module.exports = PgIntercambiosRepository;