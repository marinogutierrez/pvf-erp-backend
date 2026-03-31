const express = require('express');
const app = express();

const PUERTO = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
    res.json({ estatus: 'Online', empresa: 'Grupo PVF ERP API', version: '1.0.0' });
});

app.listen(PUERTO, () => {
    console.log(`Servidor de Grupo PVF encendido en el puerto ${PUERTO}`);
});