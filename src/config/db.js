const { Pool } = require('pg');

// Conectamos usando la llave secreta de Render
// Al ser una URL Interna, no requiere SSL, ya es una red privada.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Prueba de conexión
pool.on('connect', () => {
    console.log('✅ Conexión establecida con la Base de Datos PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en la base de datos:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
