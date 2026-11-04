const express = require('express');
const cors = require('cors');

const categoriasRoutes = require('./routes/categorias.routes');
const productosRoutes = require('./routes/productos.routes');

const app = express();

app.use(cors());          // permite peticiones desde la web y el móvil
app.use(express.json());

// Log simple de cada petición (útil para ver accesos desde otros equipos)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.ip}  ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    api: 'Ferretería API',
    version: '1.0.0',
    endpoints: ['/api/categorias', '/api/productos'],
  });
});

app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);

// Ruta no encontrada
app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

// Manejo centralizado de errores (incluye errores de MySQL)
app.use((err, req, res, next) => {
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
    return res.status(409).json({ mensaje: 'No se puede eliminar: la categoría tiene productos asociados' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ mensaje: 'Ya existe un registro con ese nombre' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ mensaje: 'La categoría indicada no existe' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'JSON inválido' });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

module.exports = app;
