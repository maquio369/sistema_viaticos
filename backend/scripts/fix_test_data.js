const pool = require('../config/database');

async function fixData() {
    const client = await pool.connect();
    try {
        // 1. Get a valid category
        const catRes = await client.query('SELECT id_categoria_del_empleado FROM categorias_del_empleado LIMIT 1');
        if (catRes.rows.length === 0) { console.log('No categories found!'); return; }
        const validCatId = catRes.rows[0].id_categoria_del_empleado;
        console.log('Using valid Category ID:', validCatId);

        // 2. Set literal for category 1
        await client.query("UPDATE categorias_del_empleado SET literal = 'A' WHERE id_categoria_del_empleado = 1");
        console.log("Updated category 1 literal to 'A'.");

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

fixData();
