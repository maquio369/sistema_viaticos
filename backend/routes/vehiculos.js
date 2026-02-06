const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// ==========================================
// CATALOGOS
// ==========================================

// Obtener usos de vehículos
router.get('/usos', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usos_de_vehiculos WHERE esta_borrado = false ORDER BY usos_de_vehiculo');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener estatus de vehículos
router.get('/estatus', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM estatus_de_vehiculos WHERE esta_borrado = false ORDER BY estatus_de_vehiculo');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener estatus:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener clases de vehículos
router.get('/clases', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clases_de_vehiculos WHERE esta_borrado = false ORDER BY clases_de_vehiculo');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener clases:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener tipos de vehículos
router.get('/tipos', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipos_de_vehiculos WHERE esta_borrado = false ORDER BY tipos_de_vehiculo');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener tipos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener marcas de vehículos
router.get('/marcas', auth, async (req, res) => {
    try {
        console.log('Fetching marcas...');
        const result = await pool.query('SELECT * FROM marcas_de_vehiculos WHERE esta_borrado = false ORDER BY id_marca_de_vehiculo ASC');
        console.log(`Found ${result.rows.length} marcas`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener marcas:', error);
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
});

// ==========================================
// CRUD VEHICULOS
// ==========================================

// Crear nuevo vehículo
router.post('/', auth, async (req, res) => {
    try {
        const {
            id_estructura_administrativa,
            numero_economico,
            id_marca_de_vehiculo,
            id_tipo_de_vehiculo,
            id_clase_de_vehiculo,
            modelo,
            placas_anteriores,
            placas_actuales,
            numero_de_motor,
            serie,
            id_estatus_de_vehiculo,
            id_usos_de_vehiculo,
            id_empleado,
            observaciones
        } = req.body;

        const query = `
      INSERT INTO vehiculos (
        id_estructura_administrativa,
        numero_economico,
        id_marca_de_vehiculo,
        id_tipo_de_vehiculo,
        id_clase_de_vehiculo,
        modelo,
        placas_anteriores,
        placas_actuales,
        numero_de_motor,
        serie,
        id_estatus_de_vehiculo,
        id_usos_de_vehiculo,
        id_empleado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id_vehiculo
    `;

        const values = [
            id_estructura_administrativa || 1, // Default to 1 if not provided? Adjust based on requirements
            numero_economico,
            id_marca_de_vehiculo,
            id_tipo_de_vehiculo,
            id_clase_de_vehiculo,
            modelo,
            placas_anteriores,
            placas_actuales,
            numero_de_motor,
            serie,
            id_estatus_de_vehiculo,
            id_usos_de_vehiculo,
            id_empleado
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Vehículo registrado exitosamente',
            id_vehiculo: result.rows[0].id_vehiculo
        });

    } catch (error) {
        console.error('Error al registrar vehículo:', error);
        res.status(500).json({ message: 'Error al registrar vehículo', error: error.message });
    }
});

// Listar vehículos (Búsqueda básica)
router.get('/', auth, async (req, res) => {
    try {
        const { q } = req.query;
        let query = `
      SELECT 
        v.id_vehiculo,
        v.numero_economico,
        v.id_marca_de_vehiculo,
        m.marca_de_vehiculo,
        v.id_tipo_de_vehiculo,
        t.tipos_de_vehiculo,
        v.id_clase_de_vehiculo,
        v.modelo,
        v.placas_anteriores,
        v.placas_actuales,
        v.numero_de_motor,
        v.serie,
        v.id_estatus_de_vehiculo,
        v.id_usos_de_vehiculo,
        u.usos_de_vehiculo as uso,
        v.id_empleado,
        e.nombres || ' ' || e.apellido1 as resguardatario
      FROM vehiculos v
      LEFT JOIN marcas_de_vehiculos m ON v.id_marca_de_vehiculo = m.id_marca_de_vehiculo
      LEFT JOIN tipos_de_vehiculos t ON v.id_tipo_de_vehiculo = t.id_tipos_de_vehiculo
      LEFT JOIN usos_de_vehiculos u ON v.id_usos_de_vehiculo = u.id_usos_de_vehiculo
      LEFT JOIN empleados e ON v.id_empleado = e.id_empleado
      WHERE v.esta_borrado = false
    `;

        const params = [];

        if (q) {
            query += ` AND (
        v.numero_economico ILIKE $1 OR 
        v.placas_actuales ILIKE $1 OR 
        v.serie ILIKE $1
      )`;
            params.push(`%${q}%`);
        }

        query += ' ORDER BY v.id_vehiculo DESC LIMIT 50';

        const result = await pool.query(query, params);
        res.json(result.rows);

    } catch (error) {
        console.error('Error al listar vehículos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Actualizar vehículo
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            id_estructura_administrativa,
            numero_economico,
            id_marca_de_vehiculo,
            id_tipo_de_vehiculo,
            id_clase_de_vehiculo,
            modelo,
            placas_anteriores,
            placas_actuales,
            numero_de_motor,
            serie,
            id_estatus_de_vehiculo,
            id_usos_de_vehiculo,
            id_empleado
        } = req.body;

        const query = `
      UPDATE vehiculos SET
        id_estructura_administrativa = $1,
        numero_economico = $2,
        id_marca_de_vehiculo = $3,
        id_tipo_de_vehiculo = $4,
        id_clase_de_vehiculo = $5,
        modelo = $6,
        placas_anteriores = $7,
        placas_actuales = $8,
        numero_de_motor = $9,
        serie = $10,
        id_estatus_de_vehiculo = $11,
        id_usos_de_vehiculo = $12,
        id_empleado = $13
      WHERE id_vehiculo = $14
      RETURNING id_vehiculo
    `;

        const values = [
            id_estructura_administrativa || 1,
            numero_economico,
            id_marca_de_vehiculo,
            id_tipo_de_vehiculo,
            id_clase_de_vehiculo,
            modelo,
            placas_anteriores,
            placas_actuales,
            numero_de_motor,
            serie,
            id_estatus_de_vehiculo,
            id_usos_de_vehiculo,
            id_empleado,
            id
        ];

        await pool.query(query, values);
        res.json({ message: 'Vehículo actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        res.status(500).json({ message: 'Error al actualizar vehículo', error: error.message });
    }
});

// Eliminar (lógicamente) vehículo
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE vehiculos SET esta_borrado = true WHERE id_vehiculo = $1', [id]);
        res.json({ message: 'Vehículo eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        res.status(500).json({ message: 'Error al eliminar vehículo', error: error.message });
    }
});

module.exports = router;
