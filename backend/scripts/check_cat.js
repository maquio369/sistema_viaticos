const pool = require('../config/database');

async function checkCat() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT id_categoria_del_empleado, literal, literal_viatico FROM categorias_del_empleado WHERE id_categoria_del_empleado = 1');
        console.log('Category 1:', res.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkCat();
