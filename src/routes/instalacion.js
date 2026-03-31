const express = require('express');
const router = express.Router();
const db = require('../config/db');

// RUTA 1: La que ya tenías para crear las tablas (Instalación)
router.get('/instalar-base-de-datos', async (req, res) => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS catalogo_maestro (
                id SERIAL PRIMARY KEY,
                tipo TEXT,
                categoria TEXT,
                subcategoria TEXT,
                marca TEXT,
                modelo TEXT UNIQUE,
                color TEXT,
                costo_base_usd DECIMAL(10,2),
                descripcion TEXT,
                requiere_serie BOOLEAN DEFAULT FALSE,
                foto_url TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        res.json({ exito: true, mensaje: "¡Magia pura! Estructura de Grupo PVF lista." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

// RUTA 2: LA NUEVA - Recibir datos del Formulario
router.post('/productos', async (req, res) => {
    const { tipo, categoria, subcategoria, marca, modelo, color, costo, descripcion, requiereSerie, fotoUrl } = req.body;

    try {
        const query = `
            INSERT INTO catalogo_maestro 
            (tipo, categoria, subcategoria, marca, modelo, color, costo_base_usd, descripcion, requiere_serie, foto_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        const values = [tipo, categoria, subcategoria, marca, modelo, color, costo, descripcion, requiereSerie, fotoUrl];
        
        const result = await db.query(query, values);
        res.json({ exito: true, producto: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ exito: false, error: "Error al guardar: " + err.message });
    }
});

module.exports = router;
