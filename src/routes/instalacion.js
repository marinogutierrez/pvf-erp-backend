const express = require('express');
const router = express.Router();
const db = require('../config/db');

// RUTA DE INSTALACIÓN Y RESETEO TOTAL
router.get('/instalar-base-de-datos', async (req, res) => {
    try {
        // 1. LIMPIEZA CON CASCADA: Borra la tabla y cualquier dependencia (llaves foráneas, etc.)
        await db.query(`DROP TABLE IF EXISTS catalogo_maestro CASCADE;`);

        // 2. CREACIÓN DESDE CERO
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

        res.json({ exito: true, mensaje: "¡TABLA RESETEADA CON CASCADA! El sistema está totalmente limpio." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ exito: false, error: "Error en reseteo: " + err.message });
    }
});

// RUTA PARA GUARDAR PRODUCTOS (POST)
router.post('/productos', async (req, res) => {
    // Extraemos los nombres tal cual los envía el JavaScript de tu index.html
    const { tipo, categoria, subcategoria, marca, modelo, color, costo, descripcion, requiereSerie, fotoUrl } = req.body;
    
    try {
        const query = `
            INSERT INTO catalogo_maestro 
            (tipo, categoria, subcategoria, marca, modelo, color, costo_base_usd, descripcion, requiere_serie, foto_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        // Mapeamos 'costo' del formulario a 'costo_base_usd' de la tabla
        const values = [tipo, categoria, subcategoria, marca, modelo, color, costo, descripcion, requiereSerie, fotoUrl];
        
        const result = await db.query(query, values);
        console.log("Producto guardado:", result.rows[0]);
        res.json({ exito: true, producto: result.rows[0] });
    } catch (err) {
        console.error("Error al insertar:", err);
        res.status(500).json({ exito: false, error: "Error al guardar en BD: " + err.message });
    }
});

// RUTA PARA VER TODO EL INVENTARIO
router.get('/ver-inventario', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM catalogo_maestro ORDER BY fecha_creacion DESC');
        res.json({ exito: true, datos: result.rows });
    } catch (err) {
        res.status(500).json({ exito: false, error: err.message });
    }
});
module.exports = router;
