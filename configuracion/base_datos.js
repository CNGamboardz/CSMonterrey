const { Pool } = require('pg');

// Conexión directa a PostgreSQL sin archivos .env
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bdmonterrey',
  password: 'postgres', // Ajusta tu contraseña aquí si es diferente
  port: 5432,
});

// Probar conexión a la base de datos
pool.connect((error, cliente, liberar) => {
  if (error) {
    console.error('❌ Error al conectar a PostgreSQL [bdmonterrey]:', error.stack);
  } else {
    console.log('⚡ Conexión exitosa a la base de datos PostgreSQL [bdmonterrey]');
    liberar();
  }
});

module.exports = pool;
