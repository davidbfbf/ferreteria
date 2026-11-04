require('dotenv').config();
const os = require('os');
const app = require('./app');
const pool = require('./config/db');

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0'; // escucha en todas las interfaces → accesible desde la red local

function ipsLocales() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
}

app.listen(PORT, HOST, async () => {
  console.log(`\nAPI Ferretería escuchando en el puerto ${PORT}`);
  console.log(`  Local:  http://localhost:${PORT}`);
  ipsLocales().forEach((ip) => console.log(`  Red:    http://${ip}:${PORT}`));

  try {
    await pool.query('SELECT 1');
    console.log('Conexión a MySQL: OK\n');
  } catch (err) {
    console.error('No se pudo conectar a MySQL:', err.message, '\nRevisa el archivo .env\n');
  }
});
