const pool = require('../config/database');

async function testEmpleadoQuery() {
    try {
        console.log('=== Probando consulta de empleado 268 ===\n');

        // Consulta actual que estamos usando
        const result = await pool.query(
            `SELECT e.id_empleado, e.nombres, e.apellido1, e.apellido2, 
              e.id_area, a.descripcion as area_nombre,
              e.id_lugar_fisico_de_trabajo, lft.descripcion as lugar_trabajo_nombre
       FROM empleados e 
       LEFT JOIN areas a ON e.id_area = a.id_area
       LEFT JOIN areas lft ON e.id_lugar_fisico_de_trabajo = lft.id_area
       WHERE e.esta_borrado = false AND e.id_empleado = 268`
        );

        if (result.rows.length > 0) {
            const empleado = result.rows[0];
            console.log('✅ Empleado encontrado:');
            console.log('ID Empleado:', empleado.id_empleado);
            console.log('Nombre:', `${empleado.nombres} ${empleado.apellido1} ${empleado.apellido2}`);
            console.log('ID Área:', empleado.id_area);
            console.log('Área Nombre:', empleado.area_nombre);
            console.log('ID Lugar Físico de Trabajo:', empleado.id_lugar_fisico_de_trabajo);
            console.log('Lugar Trabajo Nombre:', empleado.lugar_trabajo_nombre);
            console.log('\nFormato que se mostraría en el frontend:');
            console.log(`"${empleado.nombres} ${empleado.apellido1} ${empleado.apellido2} - ${empleado.lugar_trabajo_nombre || 'Sin lugar asignado'}"`);
        } else {
            console.log('❌ No se encontró el empleado 268');
        }

        console.log('\n=== Verificando datos en tabla areas ===\n');

        const areaResult = await pool.query(
            `SELECT id_area, descripcion FROM areas WHERE id_area = 30`
        );

        if (areaResult.rows.length > 0) {
            console.log('✅ Área 30 encontrada:');
            console.log('ID Área:', areaResult.rows[0].id_area);
            console.log('Descripción:', areaResult.rows[0].descripcion);
        } else {
            console.log('❌ No se encontró el área 30');
        }

        console.log('\n=== Verificando campo id_lugar_fisico_de_trabajo del empleado 268 ===\n');

        const empleadoCheck = await pool.query(
            `SELECT id_empleado, nombres, apellido1, apellido2, id_lugar_fisico_de_trabajo 
       FROM empleados 
       WHERE id_empleado = 268`
        );

        if (empleadoCheck.rows.length > 0) {
            console.log('✅ Datos del empleado:');
            console.log(empleadoCheck.rows[0]);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

testEmpleadoQuery();
