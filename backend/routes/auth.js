const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const router = express.Router();

// Middleware para logging
router.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    console.log('Login attempt:', { usuario, password });

    const user = await pool.query('SELECT * FROM usuarios WHERE usuario = $1 AND esta_borrado = false', [usuario]);
    console.log('User found:', user.rows.length > 0 ? 'YES' : 'NO');
    
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    console.log('Stored password:', user.rows[0].contraseña);
    
    // Verificar si es hash de bcrypt o texto plano
    let validPassword = false;
    if (user.rows[0].contraseña.startsWith('$2a$') || user.rows[0].contraseña.startsWith('$2b$')) {
      // Es un hash de bcrypt
      validPassword = await bcrypt.compare(password, user.rows[0].contraseña);
    } else {
      // Es texto plano
      validPassword = password === user.rows[0].contraseña;
    }
    
    console.log('Password valid:', validPassword);
    
    if (!validPassword) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id_usuario, usuario: user.rows[0].usuario },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.rows[0].id_usuario,
        nombres: user.rows[0].nombres,
        apellidos: user.rows[0].apellidos,
        usuario: user.rows[0].usuario,
        correo: user.rows[0].correo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;