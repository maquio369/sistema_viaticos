const pool = require('../config/database');

const initDB = async () => {
    try {
        console.log('Iniciando configuración de Tablas de Bancos...');

        // 1. Crear tabla cat_bancos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cat_bancos (
                id_banco SERIAL PRIMARY KEY,
                nombre_banco VARCHAR(255) NOT NULL,
                esta_borrado BOOLEAN DEFAULT false
            );
        `);
        console.log('Tabla cat_bancos verificada/creada.');

        // 2. Crear tabla cuentas_bancarias
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cuentas_bancarias (
                id_cuenta_bancaria SERIAL PRIMARY KEY,
                id_empleado INTEGER REFERENCES empleados(id_empleado),
                id_banco INTEGER REFERENCES cat_bancos(id_banco),
                cuenta VARCHAR(50),
                clabe VARCHAR(50),
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                esta_borrado BOOLEAN DEFAULT false
            );
        `);
        console.log('Tabla cuentas_bancarias verificada/creada.');

        // 3. Poblar cat_bancos
        const bancos = [
            'BANCOPPEL', 'BBVA MEXICO', 'BANAMEX', 'SCOTIABANK INVERLAT',
            'BANOBRAS', 'HSBC MEXICO S.A.', 'SANTANDER SERFIN',
            'BANCO AZTECA', 'BANORTE', 'BANJERCITO', 'BANCO INBURSA'
        ];

        for (const banco of bancos) {
            // Check if exists to avoid duplicates (idempotency)
            const check = await pool.query('SELECT id_banco FROM cat_bancos WHERE nombre_banco = $1', [banco]);
            if (check.rows.length === 0) {
                await pool.query('INSERT INTO cat_bancos (nombre_banco) VALUES ($1)', [banco]);
                console.log(`Insertado banco: ${banco}`);
            }
        }
        console.log('Catálogo de bancos poblado.');

        console.log('Configuración completada exitosamente.');
        process.exit(0);

    } catch (error) {
        console.error('Error configurando la base de datos:', error);
        process.exit(1);
    }
};

initDB();
