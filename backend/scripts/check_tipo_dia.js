const pool = require('../config/database');

async function checkTipoDia() {
    try {
        const res = await pool.query("SELECT DISTINCT tipo_dia FROM tarifas_viaticos");
        console.log('Tipos de dia encontrados:', res.rows);
        pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkTipoDia();
