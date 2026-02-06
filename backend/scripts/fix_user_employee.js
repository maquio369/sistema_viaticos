const pool = require('../config/database');

async function fixUser() {
    try {
        console.log('Asignando empleado 268 al usuario 2...');
        await pool.query('UPDATE usuarios SET id_empleado = 268 WHERE id_usuario = 2');
        console.log('✅ Actualización completada.');
    } catch (error) {
        console.error('❌ Error al actualizar:', error);
    } finally {
        pool.end();
    }
}

fixUser();
