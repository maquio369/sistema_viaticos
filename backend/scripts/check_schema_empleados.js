const pool = require('../config/database');

async function checkSchemaEmpleados() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'empleados'");
        console.log('Empleados Columns:', res.rows.map(r => r.column_name));

        const resDL = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'empleados_datos_laborales'");
        console.log('Datos Laborales Columns:', resDL.rows.map(r => r.column_name));

        pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkSchemaEmpleados();
