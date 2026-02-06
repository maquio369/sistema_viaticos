const pool = require('../config/database');

async function createTable() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating table detalles_viaticos...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS public.detalles_viaticos (
        id_detalle_viatico integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        id_memorandum_comision integer NOT NULL,
        
        id_municipio integer,
        id_estado integer,
        id_pais integer,
        
        fecha_inicio date NOT NULL,
        fecha_fin date NOT NULL,
        dias numeric(5,2) NOT NULL DEFAULT 1.00,
        pernocta boolean NOT NULL DEFAULT false,
        
        monto_calculado numeric(10,2) NOT NULL DEFAULT 0.00,
        pasaje numeric(10,2) DEFAULT 0.00,
        combustible numeric(10,2) DEFAULT 0.00,
        otros numeric(10,2) DEFAULT 0.00,
        
        tipo_pago text NOT NULL,
        id_firma integer NOT NULL,
        
        creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_dv_memo FOREIGN KEY (id_memorandum_comision)
            REFERENCES public.memorandum_comision(id_memorandum_comision) 
            ON DELETE CASCADE,
            
        CONSTRAINT fk_dv_municipio FOREIGN KEY (id_municipio)
            REFERENCES public.municipios(id_municipio),
            
        CONSTRAINT fk_dv_estado FOREIGN KEY (id_estado)
            REFERENCES public.estados_federacion(id_estado),

        CONSTRAINT fk_dv_firma FOREIGN KEY (id_firma)
            REFERENCES public.firmas(id_firma)
      );
    `);

        // Grant permissions (Adjust 'apps' and 'readers' roles if they exist in your DB, otherwise you can comment this out or wrap in try/catch)
        // Using try-catch for grants to avoid failure if roles don't exist
        try {
            await client.query(`GRANT ALL ON TABLE public.detalles_viaticos TO postgres;`);
            // await client.query(`GRANT INSERT, DELETE, SELECT, UPDATE ON TABLE public.detalles_viaticos TO apps;`);
            // await client.query(`GRANT SELECT ON TABLE public.detalles_viaticos TO readers;`);
        } catch (grantErr) {
            console.warn('Warning: Could not grant permissions to roles (apps/readers). They might not exist.');
        }

        await client.query('COMMIT');
        console.log('Table detalles_viaticos created successfully.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating table:', error);
    } finally {
        client.release();
        pool.end();
    }
}

createTable();
