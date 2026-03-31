const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. RUTA PARA LIMPIAR Y CREAR TABLAS (Mantenimiento)
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
        res.json({ exito: true, mensaje: "Base de Datos de Grupo PVF Reiniciada Correctamente." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

// 2. RUTA PARA OBTENER LA LISTA DE SUPLIDORES (GET)
router.get('/suplidores', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM suplidores ORDER BY nombre_social ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al cargar suplidores" });
    }
});

// 3. RUTA PARA GUARDAR UN NUEVO SUPLIDOR (POST)
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

// 4. RUTA PARA VER EL INVENTARIO COMPLETO (GET)
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

// 5. RUTA PARA GUARDAR UN PRODUCTO O SERVICIO (POST)
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
// 6. RUTA PARA EDITAR UN ITEM (PUT)
router.put('/editar-producto/:id', async (req, res) => {
    const { id } = req.params;
    const { categoria, subcategoria, marca, modelo, costo, numero_serie, estatus, condicion } = req.body;
    try {
        await db.query(
            `UPDATE catalogo_maestro 
             SET categoria=$1, subcategoria=$2, marca=$3, modelo=$4, costo_base_usd=$5, numero_serie=$6, estatus=$7, condicion=$8
             WHERE id=$9`,
            [categoria, subcategoria, marca, modelo, costo, numero_serie, estatus, condicion, id]
        );
        res.json({ exito: true, mensaje: "Item actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});
