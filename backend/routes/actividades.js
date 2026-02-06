const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Guardar nueva actividad
router.post('/', auth, async (req, res) => {
  try {
    const { fecha, hora, tipoLugar, lugar, direccion, motivo, tipo, noEvento, nombreEvento } = req.body;
    const id_usuario = req.user.id;

    // Si es municipio, guardar el ID, si no, guardar el texto
    const id_municipio = tipoLugar === 'municipio' ? lugar : null;
    const lugar_texto = tipoLugar === 'municipio' ? lugar : lugar;

    const result = await pool.query(
      `INSERT INTO actividades (id_usuario, fecha, hora, tipo_lugar, lugar, id_municipio, direccion, motivo, tipo, no_evento, nombre_evento) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [id_usuario, fecha, hora, tipoLugar, lugar_texto, id_municipio, direccion, motivo, tipo, noEvento, nombreEvento]
    );

    res.json({
      success: true,
      message: 'Actividad guardada exitosamente',
      actividad: result.rows[0]
    });
  } catch (error) {
    console.error('Error guardando actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar la actividad',
      error: error.message
    });
  }
});

// Obtener actividades del usuario
router.get('/', auth, async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const result = await pool.query(
      `SELECT a.*, m.descripcion as municipio_nombre 
       FROM actividades a 
       LEFT JOIN municipios m ON a.id_municipio = m.id_municipio 
       WHERE a.id_usuario = $1 AND a.esta_borrado = false 
       ORDER BY a.fecha_creacion DESC`,
      [id_usuario]
    );

    res.json({
      success: true,
      actividades: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Actualizar actividad
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora, tipoLugar, lugar, direccion, motivo, tipo, noEvento, nombreEvento } = req.body;
    const id_usuario = req.user.id;

    const id_municipio = tipoLugar === 'municipio' ? lugar : null;
    const lugar_texto = tipoLugar === 'municipio' ? lugar : lugar;

    const result = await pool.query(
      `UPDATE actividades 
       SET fecha = $1, hora = $2, tipo_lugar = $3, lugar = $4, 
           id_municipio = $5, direccion = $6, motivo = $7, tipo = $8,
           no_evento = $9, nombre_evento = $10
       WHERE id_actividad = $11 AND id_usuario = $12
       RETURNING *`,
      [fecha, hora, tipoLugar, lugar_texto, id_municipio, direccion, motivo, tipo, noEvento, nombreEvento, id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada o no autorizada'
      });
    }

    res.json({
      success: true,
      message: 'Actividad actualizada exitosamente',
      actividad: result.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la actividad',
      error: error.message
    });
  }
});

// Eliminar actividad (Soft Delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id;

    const result = await pool.query(
      `UPDATE actividades SET esta_borrado = true 
       WHERE id_actividad = $1 AND id_usuario = $2
       RETURNING id_actividad`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada o no autorizada'
      });
    }

    res.json({
      success: true,
      message: 'Actividad eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la actividad',
      error: error.message
    });
  }
});

module.exports = router;