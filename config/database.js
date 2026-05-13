const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bdmonterrey',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Probar conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos PostgreSQL [bdmonterrey]:', err.stack);
  } else {
    console.log('⚡ Conexión exitosa a la base de datos PostgreSQL [bdmonterrey]');
    release();
  }
});

module.exports = pool;
