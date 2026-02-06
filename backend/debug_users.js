const pool = require('./config/database');

async function debugUsers() {
    try {
        const res = await pool.query('SELECT id_usuario, usuario, contraseña, esta_borrado FROM usuarios');

        console.log('--- USERS IN DB ---');
        res.rows.forEach(u => {
            const isHash = u.contraseña.startsWith('$2a$') || u.contraseña.startsWith('$2b$');
            console.log(`User: ${u.usuario}, Password: ${u.contraseña.substring(0, 10)}... (Is Hash? ${isHash}), Deleted: ${u.esta_borrado}`);
            // Warning: checking exact length or hidden chars
            console.log(`Password Length: ${u.contraseña.length}`);
        });
        pool.end();
    } catch (err) {
        console.error(err);
    }
}

debugUsers();
