const pool = require('../config/database');

async function migrateData() {
    const client = await pool.connect();
    try {
        // Copy literal to literal_viatico where it's missing
        const res = await client.query("UPDATE categorias_del_empleado SET literal_viatico = literal WHERE literal_viatico IS NULL");
        console.log(`Updated ${res.rowCount} rows.`);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

migrateData();
