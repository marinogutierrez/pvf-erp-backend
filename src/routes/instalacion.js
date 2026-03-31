const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. RUTA DE INSTALACIÓN (Borra y crea todo de nuevo)
router.get('/instalar-base-de-datos', async (req, res) => {
    try {
        await db.query(`DROP TABLE IF EXISTS catalogo_maestro CASCADE;`);
        await db.query(`DROP TABLE IF EXISTS suplidores CASCADE;`);

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

        await db.query(`
            CREATE TABLE catalogo_maestro (
                id SERIAL PRIMARY KEY,
                item_tipo TEXT DEFAULT 'PRODUCTO',
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
        res.json({ exito: true, mensaje: "Sistema Grupo PVF Reiniciado con Éxito." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

// 2. RUTAS PARA SUPLIDORES
router.get('/suplidores', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM suplidores ORDER BY nombre_social ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).json([]); }
});

router.post('/suplidores', async (req, res) => {
    const { nombre, rnc, contacto, tel, email, direccion } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO suplidores (nombre_social, rnc, contacto_nombre, telefono, email, direccion) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre, rnc, contacto, tel, email, direccion]
        );
        res.json({ exito: true, suplidor: result.rows[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

// 3. RUTAS PARA PRODUCTOS
router.get('/ver-inventario', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.*, s.nombre_social as suplidor_nombre 
            FROM catalogo_maestro c 
            LEFT JOIN suplidores s ON c.suplidor_id = s.id 
            ORDER BY c.fecha_creacion DESC
        `);
        res.json({ exito: true, datos: result.rows });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

router.post('/productos', async (req, res) => {
    const { item_tipo, categoria, subcategoria, marca, modelo, color, costo, descripcion, requiereSerie, numeroSerie, estatus, condicion, suplidor_id, fotoUrl } = req.body;
    try {
        const query = `
            INSERT INTO catalogo_maestro 
            (item_tipo, categoria, subcategoria, marca, modelo, color, costo_base_usd, descripcion, requiere_serie, numero_serie, estatus, condicion, suplidor_id, foto_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *;
        `;
        const values = [item_tipo, categoria, subcategoria, marca, modelo, color, costo, descripcion, requiereSerie, numeroSerie, estatus, condicion, suplidor_id || null, fotoUrl];
        const result = await db.query(query, values);
        res.json({ exito: true, producto: result.rows[0] });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

module.exports = router;
