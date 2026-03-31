const express = require('express');
const router = express.Router();
const db = require('../config/db');

// RUTA DE INSTALACIÓN Y RESETEO
router.get('/instalar-base-de-datos', async (req, res) => {
    try {
        // 1. LIMPIEZA TOTAL: Borramos la tabla vieja si existe
        await db.query(`DROP TABLE IF EXISTS catalogo_maestro;`);

        // 2. CREACIÓN DESDE CERO: Con todos los campos que Grupo PVF necesita
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
                foto_url TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        res.json({ exito: true, mensaje: "¡TABLA RESETEADA! El sistema está limpio y listo para recibir datos." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ exito: false, error: err.message });
    }
});

// RUTA PARA GUARDAR PRODUCTOS
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
