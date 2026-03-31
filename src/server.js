const express = require('express');
const cors = require('cors'); // El permiso para tu Mac
const app = express();
const port = process.env.PORT || 3000;

// MIDDLEWARES (Las reglas de la casa)
app.use(cors()); // Permite que el Dashboard hable con la API
app.use(express.json()); // Permite leer los datos que enviamos desde el formulario

// RUTAS
const rutasInstalacion = require('./routes/instalacion');
app.use('/api', rutasInstalacion);

app.get('/', (req, res) => {
    res.send('Servidor de Grupo PVF Operativo 🚀');
});

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});
