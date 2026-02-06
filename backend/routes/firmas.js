const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Obtener empleados que pueden ser firmas (solo cargos específicos)
router.get('/empleados-firmantes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id_empleado, e.nombres, e.apellido1, e.apellido2, 
             c.cargo, a.descripcion as area_nombre
      FROM empleados e
      LEFT JOIN cargos c ON e.id_cargo = c.id_cargo
      LEFT JOIN areas a ON e.id_area = a.id_area
      WHERE e.esta_borrado = false 
        AND e.id_cargo IN (17,18,19,20,21,22,23,24,31,32,33,34)
      ORDER BY e.nombres, e.apellido1
    `);
    res.json({
      success: true,
      empleados_firmantes: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener todas las firmas disponibles
router.get('/todas', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_firma, nombre_firma, cargo_firma FROM firmas WHERE esta_borrado = false ORDER BY nombre_firma'
    );
    res.json({
      success: true,
      firmas: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener firmas asignadas a un empleado (por área + adicionales)
router.get('/empleado/:id_empleado', async (req, res) => {
  try {
    const { id_empleado } = req.params;
    
    // Firmas por área del empleado + firmas adicionales
    const result = await pool.query(`
      SELECT DISTINCT f.id_firma, f.nombre_firma, f.cargo_firma,
             CASE 
               WHEN fa.id_area IS NOT NULL THEN 'area'
               ELSE 'adicional'
             END as tipo_asignacion
      FROM empleados e
      LEFT JOIN firmas_por_area fa ON e.id_area = fa.id_area AND fa.esta_borrado = false
      LEFT JOIN firmas_adicionales_empleado fae ON e.id_empleado = fae.id_empleado AND fae.esta_borrado = false
      JOIN firmas f ON (f.id_firma = fa.id_firma OR f.id_firma = fae.id_firma)
      WHERE e.id_empleado = $1 AND e.esta_borrado = false AND f.esta_borrado = false
      ORDER BY f.nombre_firma
    `, [id_empleado]);

    res.json({
      success: true,
      firmas: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Crear firma desde empleado y agregar como adicional
router.post('/agregar-empleado-como-firma', auth, async (req, res) => {
  try {
    const { id_empleado_destino, id_empleado_firmante } = req.body;

    // Obtener datos del empleado firmante
    const empleadoFirmante = await pool.query(`
      SELECT e.nombres, e.apellido1, e.apellido2, c.cargo
      FROM empleados e
      LEFT JOIN cargos c ON e.id_cargo = c.id_cargo
      WHERE e.id_empleado = $1 AND e.id_cargo IN (17,18,19,20,21,22,23,24,31,32,33,34)
    `, [id_empleado_firmante]);

    if (empleadoFirmante.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El empleado seleccionado no puede ser firmante'
      });
    }

    const firmante = empleadoFirmante.rows[0];
    const nombreCompleto = `${firmante.nombres} ${firmante.apellido1} ${firmante.apellido2}`.trim();
    const cargo = firmante.cargo || 'Sin cargo';

    // Verificar si ya existe una firma para este empleado
    const firmaExiste = await pool.query(
      'SELECT id_firma FROM firmas WHERE nombre_firma = $1 AND esta_borrado = false',
      [nombreCompleto]
    );

    let id_firma;
    if (firmaExiste.rows.length > 0) {
      id_firma = firmaExiste.rows[0].id_firma;
    } else {
      // Crear nueva firma
      const nuevaFirma = await pool.query(
        'INSERT INTO firmas (nombre_firma, cargo_firma, descripcion) VALUES ($1, $2, $3) RETURNING id_firma',
        [nombreCompleto, cargo, `Firma de ${nombreCompleto}`]
      );
      id_firma = nuevaFirma.rows[0].id_firma;
    }

    // Verificar si ya está asignada como adicional
    const asignacionExiste = await pool.query(
      'SELECT id FROM firmas_adicionales_empleado WHERE id_empleado = $1 AND id_firma = $2 AND esta_borrado = false',
      [id_empleado_destino, id_firma]
    );

    if (asignacionExiste.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Esta firma ya está asignada al empleado'
      });
    }

    // Asignar firma adicional
    const result = await pool.query(
      'INSERT INTO firmas_adicionales_empleado (id_empleado, id_firma) VALUES ($1, $2) RETURNING *',
      [id_empleado_destino, id_firma]
    );

    res.json({
      success: true,
      message: 'Firma adicional agregada exitosamente',
      asignacion: result.rows[0],
      firma_creada: { nombre_firma: nombreCompleto, cargo_firma: cargo }
    });
  } catch (error) {
    console.error('Error agregando empleado como firma:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Eliminar firma adicional de un empleado
router.delete('/eliminar-adicional/:id_empleado/:id_firma', auth, async (req, res) => {
  try {
    const { id_empleado, id_firma } = req.params;

    await pool.query(
      'UPDATE firmas_adicionales_empleado SET esta_borrado = true WHERE id_empleado = $1 AND id_firma = $2',
      [id_empleado, id_firma]
    );

    res.json({
      success: true,
      message: 'Firma adicional eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;