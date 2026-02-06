const pool = require('../config/database');

async function debugData() {
    const client = await pool.connect();
    try {
        const empRes = await client.query('SELECT * FROM empleados WHERE id_empleado = 1');
        console.log('Empleado 1:', empRes.rows[0]);

        if (empRes.rows[0] && empRes.rows[0].id_empleado_datos_laborales) {
            const edlInfo = await client.query('SELECT * FROM empleados_datos_laborales WHERE id_empleado_datos_laborales = $1', [empRes.rows[0].id_empleado_datos_laborales]);
            console.log('Datos Laborales:', edlInfo.rows[0]);

            if (edlInfo.rows[0] && edlInfo.rows[0].id_categoria_del_empleado) {
                const catInfo = await client.query('SELECT * FROM categorias_del_empleado WHERE id_categoria_del_empleado = $1', [edlInfo.rows[0].id_categoria_del_empleado]);
                console.log('Categoria:', catInfo.rows[0]);
            } else {
                console.log('No id_categoria_del_empleado found in datos laborales.');
            }
        } else {
            console.log('No id_empleado_datos_laborales found in empleado.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

debugData();
