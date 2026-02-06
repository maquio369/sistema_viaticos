const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const catalogosRoutes = require('./routes/catalogos');
const actividadesRoutes = require('./routes/actividades');
const memorandumRoutes = require('./routes/memorandum');
const firmasRoutes = require('./routes/firmas');
const empleadosRoutes = require('./routes/empleados');

const app = express();

app.use(cors({
  origin: true, // Allow any origin for development
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/memorandum', memorandumRoutes);
app.use('/api/firmas', firmasRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/vehiculos', require('./routes/vehiculos'));
app.use('/api/tarifas', require('./routes/tarifas'));
app.use('/api/viaticos', require('./routes/viaticos'));

app.get('/', (req, res) => {
  res.json({ message: 'API Sistema de Viáticos funcionando' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});