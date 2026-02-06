const pool = require('../config/database');

async function checkColumns() {
    try {
        const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'categorias_del_empleado'
    `);
        console.log('Columns in categorias_del_empleado:');
        res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
    } catch (err) {
        console.error('Error checking columns:', err);
    } finally {
        pool.end();
    }
}

checkColumns();
