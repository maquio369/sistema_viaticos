const express = require('express');
const pool = require('../config/database');
const router = express.Router();
const auth = require('../middleware/auth');

// Middleware para logging
router.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// CALCULAR TARIFA
router.post('/calcular', auth, async (req, res) => {
    try {
        const { id_empleado, id_municipio, pernocta } = req.body;

        if (!id_empleado || !id_municipio) {
            return res.status(400).json({ success: false, message: 'Faltan datos requeridos (empleado, municipio)' });
        }

        // 1. Obtener Nivel del Empleado (usando columna 'literal')
        const empQuery = `
            SELECT cat.literal_viatico as nivel
            FROM empleados e
            JOIN empleados_datos_laborales edl ON e.id_empleado_datos_laborales = edl.id_empleado_datos_laborales
            JOIN categorias_del_empleado cat ON edl.id_categoria_del_empleado = cat.id_categoria_del_empleado
            WHERE e.id_empleado = $1
        `;

        // Ejecutamos la query
        const empRes = await pool.query(empQuery, [id_empleado]);

        if (empRes.rows.length === 0) {
            return res.json({ success: false, message: 'No se encontró nivel (literal) para el empleado. Verifique que tenga datos laborales asignados.' });
        }

        const nivel = empRes.rows[0].nivel;

        // 2. Obtener Zona del Municipio
        const zonaQuery = `
            SELECT zm.id_zona 
            FROM zonas_municipios zm
            WHERE zm.id_municipio = $1
        `;
        const zonaRes = await pool.query(zonaQuery, [id_municipio]);

        if (zonaRes.rows.length === 0) {
            return res.json({ success: true, tarifa: 0, mensaje: 'Municipio sin zona asignada' });
        }
        const id_zona = zonaRes.rows[0].id_zona;

        // 3. Obtener Tarifa
        const tipo_dia = pernocta ? '24+' : '8-24';

        const tarifaQuery = `
            SELECT monto_diario
            FROM tarifas_viaticos
            WHERE id_zona = $1 
            AND nivel_aplicacion = $2
            AND tipo_dia = $3
            AND esta_borrado = false
        `;

        const tarifaRes = await pool.query(tarifaQuery, [id_zona, nivel, tipo_dia]);

        let tarifa = 0;
        if (tarifaRes.rows.length > 0) {
            tarifa = parseFloat(tarifaRes.rows[0].monto_diario);
        }

        res.json({
            success: true,
            tarifa: tarifa,
            debug: { nivel, id_zona, tipo_dia }
        });

    } catch (error) {
        console.error('Error calculando viaticos:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GUARDAR DETALLE
router.post('/', auth, async (req, res) => {
    try {
        const {
            id_memorandum_comision,
            id_municipio, id_estado, id_pais,
            fecha_inicio, fecha_fin, dias, pernocta,
            monto_calculado, pasaje, combustible, otros,
            tipo_pago, id_firma
        } = req.body;

        const query = `
            INSERT INTO detalles_viaticos (
                id_memorandum_comision,
                id_municipio, id_estado, id_pais,
                fecha_inicio, fecha_fin, dias, pernocta,
                monto_calculado, pasaje, combustible, otros,
                tipo_pago, id_firma
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        const values = [
            id_memorandum_comision,
            id_municipio || null, id_estado || null, id_pais || null,
            fecha_inicio, fecha_fin, dias, pernocta,
            monto_calculado, pasaje || 0, combustible || 0, otros || 0,
            tipo_pago, id_firma
        ];

        const result = await pool.query(query, values);
        res.json({ success: true, detalle: result.rows[0] });

    } catch (error) {
        console.error('Error guardando detalle:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// OBTENER DETALLES POR MEMORANDUM
router.get('/memorandum/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT dv.*, 
                   m.descripcion as municipio_nombre,
                   e.nombre_estado,
                   f.nombre_firma
            FROM detalles_viaticos dv
            LEFT JOIN municipios m ON dv.id_municipio = m.id_municipio
            LEFT JOIN estados_federacion e ON dv.id_estado = e.id_estado
            JOIN firmas f ON dv.id_firma = f.id_firma
            WHERE dv.id_memorandum_comision = $1
            ORDER BY dv.fecha_inicio ASC
        `;
        const result = await pool.query(query, [id]);
        res.json({ success: true, detalles: result.rows });
    } catch (error) {
        console.error('Error obteniendo detalles:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ELIMINAR DETALLE
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM detalles_viaticos WHERE id_detalle_viatico = $1', [id]);
        res.json({ success: true, message: 'Eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
