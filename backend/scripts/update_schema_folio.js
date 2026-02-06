const pool = require('../config/database');

async function updateSchema() {
    try {
        // Verificar si la columna ya existe
        const checkColumn = await pool.query(
            `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'memorandum_comision' AND column_name = 'folio'`
        );

        if (checkColumn.rows.length === 0) {
            console.log('Agregando columna folio a tabla memorandum_comision...');
            await pool.query('ALTER TABLE memorandum_comision ADD COLUMN folio VARCHAR(50)');
            console.log('Columna folio agregada exitosamente.');
        } else {
            console.log('La columna folio ya existe en memorandum_comision.');
        }

    } catch (error) {
        console.error('Error actualizando esquema:', error);
    } finally {
        pool.end();
    }
}

updateSchema();
