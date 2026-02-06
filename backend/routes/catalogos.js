const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// Obtener municipios
router.get('/municipios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_municipio, clave_municipio, descripcion FROM municipios WHERE esta_borrado = false ORDER BY descripcion'
    );
    res.json({
      success: true,
      municipios: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener empleados
router.get('/empleados', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id_empleado, e.nombres, e.apellido1, e.apellido2, e.id_area, a.descripcion as area_nombre
       FROM empleados e 
       LEFT JOIN areas a ON e.id_area = a.id_area
       WHERE e.esta_borrado = false 
       ORDER BY e.nombres, e.apellido1`
    );
    console.log('Empleados encontrados:', result.rows.length);
    console.log('Primer empleado:', result.rows[0]);
    res.json({
      success: true,
      empleados: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener firma por área del empleado
router.get('/firma-por-empleado/:id_empleado', async (req, res) => {
  try {
    const { id_empleado } = req.params;
    console.log('Buscando firma para empleado:', id_empleado);
    
    const result = await pool.query(
      `SELECT f.id_firma, f.nombre_firma, f.cargo_firma, e.id_area
       FROM empleados e
       JOIN firmas_por_area fa ON e.id_area = fa.id_area
       JOIN firmas f ON fa.id_firma = f.id_firma
       WHERE e.id_empleado = $1 AND e.esta_borrado = false AND fa.esta_borrado = false AND f.esta_borrado = false`,
      [id_empleado]
    );
    
    console.log('Firma encontrada:', result.rows[0]);
    res.json({
      success: true,
      firma: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error obteniendo firma:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;