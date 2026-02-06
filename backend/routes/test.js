const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// Probar conexión a la base de datos
router.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as tiempo, version() as version');
    res.json({
      success: true,
      message: 'Conexión exitosa a la base de datos',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error de conexión',
      error: error.message
    });
  }
});

// Probar tabla usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM usuarios WHERE esta_borrado = false');
    res.json({
      success: true,
      message: 'Tabla usuarios accesible',
      total_usuarios: result.rows[0].total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accediendo a tabla usuarios',
      error: error.message
    });
  }
});

// Ver usuarios disponibles
router.get('/usuarios/lista', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_usuario, nombres, apellidos, usuario, correo FROM usuarios WHERE esta_borrado = false LIMIT 10');
    res.json({
      success: true,
      usuarios: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Resetear contraseña a "123456" para un usuario específico
router.post('/reset-password/:usuario', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { usuario } = req.params;
    const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 123456
    
    const result = await pool.query(
      'UPDATE usuarios SET contraseña = $1 WHERE usuario = $2 AND esta_borrado = false RETURNING nombres, apellidos, usuario',
      [hashedPassword, usuario]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    res.json({
      success: true,
      message: `Contraseña reseteada a "123456" para el usuario: ${result.rows[0].usuario}`,
      usuario: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;