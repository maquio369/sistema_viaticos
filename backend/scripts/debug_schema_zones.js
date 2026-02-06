const pool = require('../config/database');

async function checkSchema() {
    try {
        const resMunicipios = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'municipios'");
        console.log('Municipios Columns:', resMunicipios.rows.map(r => r.column_name));

        const resEstados = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'estados_federacion'");
        console.log('Estados Columns:', resEstados.rows.map(r => r.column_name));

        const resZonas = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'zonas_viaticos'");
        console.log('Zonas Viaticos Columns:', resZonas.rows.map(r => r.column_name));

        const resTarifas = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tarifas_viaticos'");
        console.log('Tarifas Viaticos Columns:', resTarifas.rows.map(r => r.column_name));

        pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkSchema();
