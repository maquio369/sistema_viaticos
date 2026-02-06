const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const catalogosRoutes = require('./routes/catalogos');
const actividadesRoutes = require('./routes/actividades');
const memorandumRoutes = require('./routes/memorandum');
const firmasRoutes = require('./routes/firmas');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/memorandum', memorandumRoutes);
app.use('/api/firmas', firmasRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Sistema de Viáticos funcionando' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});