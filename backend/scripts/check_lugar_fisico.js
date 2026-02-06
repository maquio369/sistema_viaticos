const pool = require('../config/database');

async function checkColumnAndData() {
    try {
        // 1. Verificar columna
        const colRes = await pool.query(
            `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'empleados' AND column_name = 'id_lugar_fisico_de_trabajo'`
        );

        if (colRes.rows.length > 0) {
            console.log('✅ La columna id_lugar_fisico_de_trabajo existe.');
        } else {
            console.log('❌ La columna id_lugar_fisico_de_trabajo NO existe.');
            return;
        }

        // 2. Verificar datos de empleados clave (261 y 268)
        const empRes = await pool.query(
            `SELECT id_empleado, nombres, id_area, id_lugar_fisico_de_trabajo 
       FROM empleados 
       WHERE id_empleado IN (261, 268)`
        );

        console.table(empRes.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

checkColumnAndData();
