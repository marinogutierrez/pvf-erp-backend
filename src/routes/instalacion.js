const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Conexión a tu base de datos PostgreSQL

router.get('/', async (req, res) => {
    try {
        // 1. Crear los Tipos de Datos Estrictos (ENUMs)
        await db.query(`
            DO $$ BEGIN
                CREATE TYPE tipo_item AS ENUM ('EQUIPO', 'MATERIAL', 'MANO_OBRA');
                CREATE TYPE estatus_operativo AS ENUM ('ALMACEN', 'TRANSITO', 'PROCESO', 'PRUEBA', 'OPERATIVO', 'INSTALADO', 'HOLD');
                CREATE TYPE condicion_fisica AS ENUM ('NORMAL', 'RAYADO', 'ABOLLADO', 'ROTO', 'INCOMPLETO');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // 2. Crear Tabla: Ubicaciones Espaciales (El Árbol del Edificio)
        await db.query(`
            CREATE TABLE IF NOT EXISTS ubicaciones_espaciales (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                nombre VARCHAR(150) NOT NULL,
                tipo_nodo VARCHAR(50) NOT NULL,
                parent_id UUID REFERENCES ubicaciones_espaciales(id) ON DELETE CASCADE,
                porcentaje_ancho DECIMAL(5,2) DEFAULT 100.00,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Crear Tabla: Catálogo Maestro
        await db.query(`
            CREATE TABLE IF NOT EXISTS catalogo_maestro (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                marca VARCHAR(100) NOT NULL,
                modelo VARCHAR(100) NOT NULL,
                descripcion TEXT NOT NULL,
                tipo tipo_item NOT NULL,
                categoria VARCHAR(50) NOT NULL,
                requiere_serie BOOLEAN DEFAULT FALSE,
                costo_base_usd DECIMAL(12,2) DEFAULT 0.00,
                activo BOOLEAN DEFAULT TRUE
            );
        `);

        // 4. Crear Tabla: Inventario Físico (Equipos Serializados)
        await db.query(`
            CREATE TABLE IF NOT EXISTS inventario_instancias (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                catalogo_id UUID REFERENCES catalogo_maestro(id) NOT NULL,
                ubicacion_actual_id UUID REFERENCES ubicaciones_espaciales(id),
                numero_serie VARCHAR(100) UNIQUE,
                lote_fabricacion VARCHAR(100),
                cantidad DECIMAL(10,2) DEFAULT 1.00,
                estatus estatus_operativo DEFAULT 'ALMACEN',
                condicion condicion_fisica DEFAULT 'NORMAL',
                notas_hold TEXT,
                evidencia_foto_url TEXT,
                ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Si todo sale bien, respondemos con éxito
        res.json({ exito: true, mensaje: "¡Magia pura! Las tablas de Grupo PVF han sido creadas en PostgreSQL." });

    } catch (error) {
        console.error("Error al instalar la base de datos:", error);
        res.status(500).json({ exito: false, error: error.message });
    }
});

module.exports = router;
