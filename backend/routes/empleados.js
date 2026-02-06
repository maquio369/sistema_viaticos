const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Buscar empleados
router.get('/buscar', auth, async (req, res) => {
  try {
    const { q } = req.query;

    let query = `
      SELECT 
        e.id_empleado,
        edl.rfc,
        CONCAT(e.nombres, ' ', e.apellido1, ' ', e.apellido2) as nombre_completo,
        a.descripcion as area,
        b.nombre_banco,
        cb.cuenta,
        cb.clabe
      FROM empleados e
      LEFT JOIN empleados_datos_laborales edl ON e.id_empleado_datos_laborales = edl.id_empleado_datos_laborales
      LEFT JOIN areas a ON e.id_area = a.id_area AND a.esta_borrado = false
      LEFT JOIN cuentas_bancarias cb ON e.id_empleado = cb.id_empleado AND cb.esta_borrado = false
      LEFT JOIN cat_bancos b ON cb.id_banco = b.id_banco
      WHERE e.esta_borrado = false
    `;

    const params = [];

    if (q) {
      query += ` AND (
        LOWER(e.nombres) LIKE LOWER($1) OR 
        LOWER(e.apellido1) LIKE LOWER($1) OR 
        LOWER(e.apellido2) LIKE LOWER($1) OR
        LOWER(edl.rfc) LIKE LOWER($1)
      )`;
      params.push(`%${q}%`);
    }

    query += ` ORDER BY e.nombres, e.apellido1 LIMIT 50`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error buscando empleados:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Agregar empleado a cuenta personal (placeholder)
router.post('/agregar/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Aquí implementarías la lógica para agregar el empleado
    // Por ahora solo devolvemos éxito
    res.json({ message: 'Empleado agregado exitosamente', id_empleado: id });
  } catch (error) {
    console.error('Error agregando empleado:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Guardar/Actualizar cuenta bancaria
router.post('/cuenta-bancaria', async (req, res) => {
  try {
    const { id_empleado, id_banco, cuenta, clabe } = req.body;

    // Verificar si ya existe una cuenta para este empleado
    const check = await pool.query(
      'SELECT id_cuenta_bancaria FROM cuentas_bancarias WHERE id_empleado = $1 AND esta_borrado = false',
      [id_empleado]
    );

    if (check.rows.length > 0) {
      // Actualizar
      await pool.query(
        `UPDATE cuentas_bancarias 
                 SET id_banco = $1, cuenta = $2, clabe = $3
                 WHERE id_empleado = $4`,
        [id_banco, cuenta, clabe, id_empleado]
      );
    } else {
      // Insertar
      await pool.query(
        `INSERT INTO cuentas_bancarias (id_empleado, id_banco, cuenta, clabe)
                 VALUES ($1, $2, $3, $4)`,
        [id_empleado, id_banco, cuenta, clabe]
      );
    }

    res.json({ success: true, message: 'Cuenta bancaria guardada exitosamente' });

  } catch (error) {
    console.error('Error guardando cuenta bancaria:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener cuenta bancaria
router.get('/cuenta-bancaria/:id_empleado', async (req, res) => {
  try {
    const { id_empleado } = req.params;
    const result = await pool.query(
      `SELECT c.id_cuenta_bancaria, c.id_banco, c.cuenta, c.clabe, b.nombre_banco
             FROM cuentas_bancarias c
             JOIN cat_bancos b ON c.id_banco = b.id_banco
             WHERE c.id_empleado = $1 AND c.esta_borrado = false`,
      [id_empleado]
    );

    res.json({
      success: true,
      cuenta: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error obteniendo cuenta bancaria:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;