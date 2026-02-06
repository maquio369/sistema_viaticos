const pool = require('../config/database');

const updateSchema = async () => {
    try {
        console.log('Iniciando actualización del esquema de base de datos...');

        // Add no_evento column
        await pool.query(`
      ALTER TABLE actividades 
      ADD COLUMN IF NOT EXISTS no_evento text,
      ADD COLUMN IF NOT EXISTS nombre_evento text;
    `);

        console.log('Columnas no_evento y nombre_evento agregadas correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error actualizando el esquema:', error);
        process.exit(1);
    }
};

updateSchema();
