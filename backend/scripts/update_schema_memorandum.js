const pool = require('../config/database');

async function updateSchema() {
    try {
        console.log('Iniciando actualización del esquema para Memorandum y Comisión...');

        // Verificar si la columna ya existe
        const columnCheck = await pool.query(
            `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'memorandum_comision' AND column_name = 'id_vehiculo'`
        );

        if (columnCheck.rows.length === 0) {
            console.log('Agregando columna id_vehiculo a la tabla memorandum_comision...');
            await pool.query(
                `ALTER TABLE memorandum_comision 
         ADD COLUMN id_vehiculo INTEGER REFERENCES vehiculos(id_vehiculo)`
            );
            console.log('Columna id_vehiculo agregada exitosamente.');
        } else {
            console.log('La columna id_vehiculo ya existe en la tabla memorandum_comision.');
        }

        console.log('Actualización de esquema completada.');
    } catch (error) {
        console.error('Error al actualizar el esquema:', error);
    } finally {
        pool.end();
    }
}

updateSchema();
