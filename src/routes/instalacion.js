// --- ACTUALIZACIÓN DE TABLAS EN GITHUB ---
router.get('/instalar-base-de-datos', async (req, res) => {
    try {
        await db.query(`DROP TABLE IF EXISTS catalogo_maestro CASCADE;`);
        await db.query(`DROP TABLE IF EXISTS servicios_maestro CASCADE;`);

        // 1. INVENTARIO (Solo tangible)
        await db.query(`
            CREATE TABLE catalogo_maestro (
                id SERIAL PRIMARY KEY,
                categoria TEXT,
                marca TEXT,
                modelo TEXT,
                costo_usd DECIMAL(10,2),
                numero_serie TEXT,
                estatus TEXT DEFAULT 'ALMACEN',
                suplidor_id INTEGER REFERENCES suplidores(id),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. CATÁLOGO DE SERVICIOS (Intangible)
        await db.query(`
            CREATE TABLE servicios_maestro (
                id SERIAL PRIMARY KEY,
                nombre_servicio TEXT NOT NULL,
                descripcion TEXT,
                tipo_ejecutor TEXT, -- Persona Física, Compañía, Empleado
                costo_interno_usd DECIMAL(10,2),
                precio_venta_usd DECIMAL(10,2),
                categoria TEXT, -- Redes, Audio, etc.
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        res.json({ exito: true, mensaje: "Arquitectura Grupo PVF: Inventario y Servicios separados." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// NUEVA RUTA PARA GUARDAR SERVICIOS
router.post('/servicios', async (req, res) => {
    const { nombre, descripcion, ejecutor, costo, precio, categoria } = req.body;
    try {
        await db.query(
            `INSERT INTO servicios_maestro (nombre_servicio, descripcion, tipo_ejecutor, costo_interno_usd, precio_venta_usd, categoria) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [nombre, descripcion, ejecutor, costo, precio, categoria]
        );
        res.json({ exito: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
