const pool = require('../config/database');


// Simple mock for auth since we are testing internal logic or we need a token.
// Ideally we should bypass auth for testing or login first.
// For quick verification script, we can query DB directly to simulate the logic 
// OR simpler: we replicate the query logic here to see if it works.

// Better: Let's make this script run the queries directly to verify data integrity
// and then print what the API WOULD return.

async function testLogic() {
    const client = await pool.connect();
    try {
        // 1. Pick a random employee
        const empRes = await client.query('SELECT id_empleado FROM empleados LIMIT 1');
        if (empRes.rows.length === 0) { console.log('No employees found'); return; }
        const id_empleado = empRes.rows[0].id_empleado;

        // 2. Pick a random municipality with a zone
        const munRes = await client.query(`
        SELECT zm.id_municipio, m.descripcion 
        FROM zonas_municipios zm
        JOIN municipios m ON zm.id_municipio = m.id_municipio
        LIMIT 1
    `);
        if (munRes.rows.length === 0) { console.log('No municipalities with zone found'); return; }
        const id_municipio = munRes.rows[0].id_municipio;
        const munName = munRes.rows[0].descripcion;

        console.log(`Testing with Employee ID: ${id_empleado}, Mun: ${munName} (${id_municipio})`);

        // --- LOGIC REPLICATION START ---

        // Level
        const levelQ = `
        SELECT cat.literal_viatico as nivel
        FROM empleados e
        JOIN empleados_datos_laborales edl ON e.id_empleado_datos_laborales = edl.id_empleado_datos_laborales
        JOIN categorias_del_empleado cat ON edl.id_categoria_del_empleado = cat.id_categoria_del_empleado
        WHERE e.id_empleado = $1
    `;
        const levelRes = await client.query(levelQ, [id_empleado]);
        if (levelRes.rows.length === 0) {
            console.log('❌ FAILED: Could not find level (literal) for employee.');
        } else {
            console.log(`✅ Level found: ${levelRes.rows[0].nivel}`);
        }
        const nivel = levelRes.rows.length > 0 ? levelRes.rows[0].nivel : 'N/A';

        // Zone
        const zoneQ = `SELECT id_zona FROM zonas_municipios WHERE id_municipio = $1`;
        const zoneRes = await client.query(zoneQ, [id_municipio]);
        const id_zona = zoneRes.rows.length > 0 ? zoneRes.rows[0].id_zona : 'N/A';
        console.log(`✅ Zone found: ${id_zona}`);

        // Rate (With Pernocta)
        const tipo_dia = '24+';
        const rateQ = `
        SELECT monto_diario
        FROM tarifas_viaticos
        WHERE id_zona = $1 
        AND nivel_aplicacion = $2
        AND tipo_dia = $3
        AND esta_borrado = false
    `;

        // Only run if we have valid inputs
        if (nivel !== 'N/A' && id_zona !== 'N/A') {
            const rateRes = await client.query(rateQ, [id_zona, nivel, tipo_dia]);
            if (rateRes.rows.length > 0) {
                console.log(`✅ Rate found: $${rateRes.rows[0].monto_diario}`);
            } else {
                console.log(`⚠️ Rate NOT found for Zone ${id_zona} / Level ${nivel} / ${tipo_dia}`);
                // List available rates to debug
                const avail = await client.query('SELECT * FROM tarifas_viaticos WHERE id_zona = $1', [id_zona]);
                console.log('Available rates for this zone:', avail.rows.map(r => `${r.nivel_aplicacion}: ${r.monto_diario}`));
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

testLogic();
