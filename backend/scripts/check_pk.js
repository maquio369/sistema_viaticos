const pool = require('../config/database');

async function checkColumns() {
    try {
        const result = await pool.query(
            `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'usuarios'`
        );

        console.log('Columnas en usuarios:');
        result.rows.forEach(row => console.log(row.column_name));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

checkColumns();
