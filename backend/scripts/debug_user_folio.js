const pool = require('../config/database');

async function debugUser(userId) {
    try {
        console.log(`--- Diagnóstico para Usuario ID: ${userId} ---`);

        // 1. Ver Usuario
        const userRes = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [userId]);
        if (userRes.rows.length === 0) {
            console.log('❌ Usuario no encontrado.');
            return;
        }
        const user = userRes.rows[0];
        console.log('✅ Usuario encontrado:', { id: user.id_usuario, usuario: user.usuario, id_empleado: user.id_empleado });

        if (!user.id_empleado) {
            console.log('❌ El usuario no tiene id_empleado asignado.');
            return;
        }

        // 2. Ver Empleado
        const empRes = await pool.query('SELECT * FROM empleados WHERE id_empleado = $1', [user.id_empleado]);
        if (empRes.rows.length === 0) {
            console.log(`❌ Empleado ID ${user.id_empleado} no encontrado en la tabla empleados.`);
            return;
        }
        const emp = empRes.rows[0];
        console.log('✅ Empleado encontrado:', { id: emp.id_empleado, nombre: emp.nombres, id_area: emp.id_area });

        if (!emp.id_area) {
            console.log('❌ El empleado no tiene id_area asignado.');
            return;
        }

        // 3. Ver Área
        const areaRes = await pool.query('SELECT * FROM areas WHERE id_area = $1', [emp.id_area]);
        if (areaRes.rows.length === 0) {
            console.log(`❌ Área ID ${emp.id_area} no encontrada en la tabla areas.`);
            return;
        }
        const area = areaRes.rows[0];
        console.log('✅ Área encontrada:', { id: area.id_area, descripcion: area.descripcion, oficio: area.oficio });

        if (!area.oficio) {
            console.log('⚠️ El área existe pero el campo "oficio" es NULL o vacío.');
        } else {
            console.log(`🎉 Cadena completa exitosa. Folio esperado: ${area.oficio}[ID_MEMO]`);
        }

    } catch (error) {
        console.error('Error en diagnóstico:', error);
    } finally {
        pool.end();
    }
}

// Ejecutar para el usuario 2 (basado en el log del usuario)
debugUser(2);
