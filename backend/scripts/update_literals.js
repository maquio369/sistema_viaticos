const pool = require('../config/database');

async function updateLiterals() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Limpiar la tabla (Reset to NULL)
        await client.query('UPDATE categorias_del_empleado SET literal_viatico = NULL');
        console.log('✅ Tabla limpiada (literal_viatico = NULL)');

        // 2. Asignar literal_viatico = 'C'
        const resC = await client.query(`
      UPDATE categorias_del_empleado 
      SET literal_viatico = 'C'
      WHERE clave_categoria IN (160305, 160401, 160402, 160406, 160407)
    `);
        console.log(`✅ Asignado 'C' a ${resC.rowCount} categorías.`);

        // 3. Asignar literal_viatico = 'E'
        const resE = await client.query(`
      UPDATE categorias_del_empleado 
      SET literal_viatico = 'E'
      WHERE clave_categoria = 160804
    `);
        console.log(`✅ Asignado 'E' a ${resE.rowCount} categorías.`);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

updateLiterals();
