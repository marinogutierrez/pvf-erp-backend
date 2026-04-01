const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// 1. CONFIGURACIÓN INICIAL (RESET COMPLETO)
// ==========================================
router.get('/instalar-base-de-datos', async (req, res) => {
    try {
        // Borramos todo en orden para evitar errores de llaves foráneas
        await db.query(`DROP TABLE IF EXISTS catalogo_maestro CASCADE;`);
        await db.query(`DROP TABLE IF EXISTS servicios_maestro CASCADE;`);
        await db.query(`DROP TABLE IF EXISTS suplidores CASCADE;`);

        // Tabla 1: Suplidores (Estándar R.D.)
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

        // Tabla 2: Inventario Físico (Tangible)
        await db.query(`
            CREATE TABLE catalogo_maestro (
                id SERIAL PRIMARY KEY,
                categoria TEXT,
                subcategoria TEXT,
                marca TEXT,
                modelo TEXT,
                costo_base_usd DECIMAL(10,2),
                numero_serie TEXT,
                estatus TEXT DEFAULT 'ALMACEN',
                condicion TEXT DEFAULT 'NUEVO',
                suplidor_id INTEGER REFERENCES suplidores(id) ON DELETE SET NULL,
                foto_url TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tabla 3: Catálogo de Servicios (Intangible)
        await db.query(`
            CREATE TABLE servicios_maestro (
                id SERIAL PRIMARY KEY,
                nombre_servicio TEXT NOT NULL,
                descripcion TEXT,
                tipo_ejecutor TEXT, 
                costo_interno_usd DECIMAL(10,2),
                precio_venta_usd DECIMAL(10,2),
                categoria TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        res.json({ exito: true, mensaje: "Arquitectura Grupo PVF validada y activa." });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});

// ==========================================
// 2. GESTIÓN DE SUPLIDORES
// ==========================================
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
    } catch (err) { res.status(500).json({ exito: false, error: err.message }); }
});

// ==========================================
// 3. GESTIÓN DE INVENTARIO (PRODUCTOS)
// ==========================================

// VER INVENTARIO COMPLETO (Con nombre de suplidor)
router.get('/ver-inventario', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.*, s.nombre_social as suplidor_nombre 
            FROM catalogo_maestro c 
            LEFT JOIN suplidores s ON c.suplidor_id = s.id 
            ORDER BY c.fecha_creacion DESC
        `);
        res.json({ exito: true, datos: result.rows });
    } catch (err) { res.status(500).json({ exito: false, error: err.message }); }
});

// GUARDAR PRODUCTO
router.post('/productos', async (req, res) => {
    const { categoria, subcategoria, marca, modelo, costo, numeroSerie, estatus, condicion, suplidor_id, fotoUrl } = req.body;
    try {
        const query = `
            INSERT INTO catalogo_maestro 
            (categoria, subcategoria, marca, modelo, costo_base_usd, numero_serie, estatus, condicion, suplidor_id, foto_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
        const values = [categoria, subcategoria, marca, modelo, costo, numeroSerie, estatus, condicion, suplidor_id || null, fotoUrl];
        await db.query(query, values);
        res.json({ exito: true });
    } catch (err) { res.status(500).json({ exito: false, error: err.message }); }
});

// EDITAR PRODUCTO (La corrección para el botón de lápiz)
router.put('/editar-producto/:id', async (req, res) => {
    const { id } = req.params;
    const { categoria, marca, modelo, costo, numero_serie, estatus } = req.body;
    try {
        await db.query(
            `UPDATE catalogo_maestro 
             SET categoria=$1, marca=$2, modelo=$3, costo_base_usd=$4, numero_serie=$5, estatus=$6 
             WHERE id=$7`,
            [categoria, marca, modelo, costo, numero_serie, estatus, id]
        );
        res.json({ exito: true });
    } catch (err) { res.status(500).json({ exito: false, error: err.message }); }
});

// ELIMINAR PRODUCTO (La corrección para el zafacón)
router.delete('/eliminar-producto/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM catalogo_maestro WHERE id = $1', [id]);
        res.json({ exito: true, mensaje: "Registro eliminado." });
    } catch (err) { res.status(500).json({ exito: false, error: err.message }); }
});

// ==========================================
// 4. GESTIÓN DE SERVICIOS
// ==========================================
router.post('/servicios', async (req, res) => {
    const { nombre, descripcion, ejecutor, costo, precio, categoria } = req.body;
    try {
        await db.query(
            `INSERT INTO servicios_maestro (nombre_servicio, descripcion, tipo_ejecutor, costo_interno_usd, precio_venta_usd, categoria) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [nombre, descripcion, ejecutor, costo, precio, categoria]
        );
        res.json({ exito: true });
    } catch (err) { res.status(500).json({ exito: false, error: err.message }); }
});

router.get('/ver-servicios', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM servicios_maestro ORDER BY fecha_creacion DESC');
        res.json({ exito: true, datos: result.rows });
    } catch (err) { res.status(500).json({ exito: false, error: err.message }); }
});

module.exports = router;
