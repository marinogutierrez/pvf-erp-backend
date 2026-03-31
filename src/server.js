const express = require('express');
const app = express();
const rutaInstalacion = require('./routes/instalacion'); // <-- LÍNEA NUEVA

const PUERTO = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
    res.json({ estatus: 'Online', empresa: 'Grupo PVF ERP API', version: '1.0.0' });
});

// Registrar la ruta secreta de instalación
app.use('/api/instalar-base-de-datos', rutaInstalacion); // <-- LÍNEA NUEVA

app.listen(PUERTO, () => {
    console.log(`Servidor de Grupo PVF encendido en el puerto ${PUERTO}`);
});
