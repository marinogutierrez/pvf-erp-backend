const { Pool } = require('pg');

// Conectamos usando la llave secreta que pusimos en Render
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Esto es obligatorio por seguridad en la nube
    }
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
