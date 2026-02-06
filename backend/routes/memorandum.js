const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Guardar memorandum/comisión
router.post('/', auth, async (req, res) => {
  try {
    const { id_actividad, id_empleado, periodo_inicio, periodo_fin, tipo_transporte, id_firma, observaciones } = req.body;

    const result = await pool.query(
      `INSERT INTO memorandum_comision (id_actividad, id_empleado, periodo_inicio, periodo_fin, tipo_transporte, id_firma, observaciones) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id_actividad, id_empleado, periodo_inicio, periodo_fin, tipo_transporte, id_firma, observaciones]
    );

    res.json({
      success: true,
      message: 'Memorandum/Comisión guardado exitosamente',
      memorandum: result.rows[0]
    });
  } catch (error) {
    console.error('Error guardando memorandum:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el memorandum',
      error: error.message
    });
  }
});

// Obtener memorandums del usuario
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mc.*, 
              a.motivo, a.fecha as fecha_actividad, a.direccion,
              CONCAT(e.nombres, ' ', e.apellido1, ' ', e.apellido2) as empleado_nombre,
              f.nombre_firma, f.cargo_firma
       FROM memorandum_comision mc
       JOIN actividades a ON mc.id_actividad = a.id_actividad
       JOIN empleados e ON mc.id_empleado = e.id_empleado
       JOIN firmas f ON mc.id_firma = f.id_firma
       WHERE mc.esta_borrado = false
       ORDER BY mc.fecha_creacion DESC`
    );

    res.json({
      success: true,
      memorandums: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;