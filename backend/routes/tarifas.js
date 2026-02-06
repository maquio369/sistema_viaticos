const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// Middleware para logging
router.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// Obtener todas las tarifas
router.get('/', async (req, res) => {
    try {
        const query = `
      SELECT t.*, z.codigo_zona, z.nombre_zona
      FROM tarifas_viaticos t
      JOIN zonas_viaticos z ON t.id_zona = z.id_zona
      WHERE t.esta_borrado = false
      ORDER BY t.id_tarifa ASC
    `;
        const tarifas = await pool.query(query);
        res.json(tarifas.rows);
    } catch (error) {
        console.error('Error al obtener tarifas:', error);
        res.status(500).json({ message: 'Error del servidor al obtener tarifas' });
    }
});

// Actualizar tarifa
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { monto_diario } = req.body;

        if (!monto_diario) {
            return res.status(400).json({ message: 'El monto diario es requerido' });
        }

        const query = `
      UPDATE tarifas_viaticos
      SET monto_diario = $1, vigente_desde = CURRENT_DATE
      WHERE id_tarifa = $2
      RETURNING *
    `;

        const result = await pool.query(query, [monto_diario, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tarifa no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar tarifa:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar tarifa' });
    }
});

module.exports = router;
