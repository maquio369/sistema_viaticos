const pool = require('../config/database');

async function verifySchema() {
    try {
        const result = await pool.query(
            `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'memorandum_comision' AND column_name = 'id_vehiculo'`
        );

        if (result.rows.length > 0) {
            console.log('VERIFICACIÓN EXITOSA: La columna id_vehiculo existe.');
            console.log(result.rows[0]);
        } else {
            console.log('FALLO DE VERIFICACIÓN: La columna id_vehiculo NO existe.');
        }

    } catch (error) {
        console.error('Error verificando esquema:', error);
    } finally {
        pool.end();
    }
}

verifySchema();
