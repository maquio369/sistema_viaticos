const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Guardar nueva actividad
router.post('/', auth, async (req, res) => {
  try {
    const { fecha, hora, tipoLugar, lugar, direccion, motivo, tipo } = req.body;
    const id_usuario = req.user.id;

    // Si es municipio, guardar el ID, si no, guardar el texto
    const id_municipio = tipoLugar === 'municipio' ? lugar : null;
    const lugar_texto = tipoLugar === 'municipio' ? lugar : lugar;

    const result = await pool.query(
      `INSERT INTO actividades (id_usuario, fecha, hora, tipo_lugar, lugar, id_municipio, direccion, motivo, tipo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id_usuario, fecha, hora, tipoLugar, lugar_texto, id_municipio, direccion, motivo, tipo]
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

module.exports = router;