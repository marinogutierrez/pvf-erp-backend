const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. RUTA DE INSTALACIÓN (Solo se usa si necesitas resetear todo)
router.get('/instalar-base-de-datos', async (req, res) => {
    try {
        await db.query(`DROP TABLE IF EXISTS catalogo_maestro CASCADE;`);
        await db.query(`
            CREATE TABLE catalogo_maestro (
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
                numero_serie TEXT,
                estatus TEXT,
                condicion TEXT,
                foto_url TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        res.json({ exito: true, mensaje: "Base de Datos de Grupo PVF lista y limpia." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

// 2. RUTA PARA GUARDAR PRODUCTOS (POST)
router.post('/productos', async (req, res) => {
    const { tipo, categoria, subcategoria, marca, modelo, color, costo, descripcion, requiereSerie, numeroSerie, estatus, condicion, fotoUrl } = req.body;
    try {
        const query = `
            INSERT INTO catalogo_maestro 
            (tipo, categoria, subcategoria, marca, modelo, color, costo_base_usd, descripcion, requiere_serie, numero_serie, estatus, condicion, foto_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *;
        `;
        const values = [tipo, categoria, subcategoria, marca, modelo, color, costo, descripcion, requiereSerie, numeroSerie, estatus, condicion, fotoUrl];
        const result = await db.query(query, values);
        res.json({ exito: true, producto: result.rows[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

// 3. RUTA PARA VER INVENTARIO (GET)
router.get('/ver-inventario', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM catalogo_maestro ORDER BY fecha_creacion DESC');
        res.json({ exito: true, datos: result.rows });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});
// 4. RUTA PARA ELIMINAR UN PRODUCTO (DELETE)
router.delete('/eliminar-producto/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM catalogo_maestro WHERE id = $1', [id]);
        res.json({ exito: true, mensaje: "Equipo eliminado correctamente." });
    } catch (err) {
        console.error("Error al eliminar:", err);
        res.status(500).json({ exito: false, error: err.message });
    }
});
module.exports = router;
