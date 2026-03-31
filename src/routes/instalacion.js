const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. INSTALACIÓN / RESETEO (Actualizado para Suplidores y Servicios)
router.get('/instalar-base-de-datos', async (req, res) => {
    try {
        await db.query(`DROP TABLE IF EXISTS catalogo_maestro CASCADE;`);
        await db.query(`DROP TABLE IF EXISTS suplidores CASCADE;`);

        // Tabla de Suplidores (Estándar RD)
        await db.query(`
            CREATE TABLE suplidores (
                id SERIAL PRIMARY KEY,
                nombre_social TEXT NOT NULL,
                rnc TEXT UNIQUE,
                contacto_nombre TEXT,
                telefono TEXT,
                email TEXT,
                direccion TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tabla Maestra Actualizada
        await db.query(`
            CREATE TABLE catalogo_maestro (
                id SERIAL PRIMARY KEY,
                item_tipo TEXT DEFAULT 'PRODUCTO', -- PRODUCTO o SERVICIO
                categoria TEXT,
                subcategoria TEXT,
                marca TEXT,
                modelo TEXT,
                color TEXT,
                costo_base_usd DECIMAL(10,2),
                descripcion TEXT,
                requiere_serie BOOLEAN DEFAULT FALSE,
                numero_serie TEXT,
                estatus TEXT,
                condicion TEXT,
                suplidor_id INTEGER REFERENCES suplidores(id),
                foto_url TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        res.json({ exito: true, mensaje: "Sistema actualizado: Suplidores y Tipos de Item listos." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

// 2. RUTAS PARA SUPLIDORES
router.get('/suplidores', async (req, res) => {
    const result = await db.query('SELECT * FROM suplidores ORDER BY nombre_social ASC');
    res.json(result.rows);
});

router.post('/suplidores', async (req, res) => {
    const { nombre, rnc, contacto, tel, email, dir } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO suplidores (nombre_social, rnc, contacto_nombre, telefono, email, direccion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, rnc, contacto, tel, email, dir]
        );
        res.json({ exito: true, suplidor: result.rows[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

// 3. RUTA PARA GUARDAR PRODUCTOS (Actualizada)
router.post('/productos', async (req, res) => {
    const { item_tipo, categoria, subcategoria, marca, modelo, color, costo, descripcion, requiereSerie, numeroSerie, estatus, condicion, suplidor_id, fotoUrl } = req.body;
    try {
        const query = `
            INSERT INTO catalogo_maestro 
            (item_tipo, categoria, subcategoria, marca, modelo, color, costo_base_usd, descripcion, requiere_serie, numero_serie, estatus, condicion, suplidor_id, foto_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *;
        `;
        const values = [item_tipo, categoria, subcategoria, marca, modelo, color, costo, descripcion, requiereSerie, numeroSerie, estatus, condicion, suplidor_id, fotoUrl];
        const result = await db.query(query, values);
        res.json({ exito: true, producto: result.rows[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

module.exports = router;
