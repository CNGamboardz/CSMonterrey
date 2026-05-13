const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
require('dotenv').config();

const pool = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const queryRoutes = require('./routes/queryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// =========================================================================
// RUTAS DE LA API (Backend)
// =========================================================================
app.use('/api/auth', authRoutes);
app.use('/api/queries', queryRoutes);

// Endpoint de conveniencia para inicializar/poblar la base de datos automáticamente
app.get('/api/setup-db', async (req, res) => {
  try {
    const schemaPath = path.join(__dirname, 'database_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    return res.json({ 
      success: true, 
      message: '¡Base de datos estructurada y poblada exitosamente con datos premium!' 
    });
  } catch (error) {
    console.error('Error al ejecutar el script SQL:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al inicializar la base de datos', 
      error: error.message 
    });
  }
});

// =========================================================================
// RUTAS DE VISTAS (Frontend / Renderizado de HTML)
// =========================================================================

// Página de inicio (Landing page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Página de inicio de sesión
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Página de registro
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Página del Panel de Control (Dashboard con las 10 consultas)
app.get('/dashboard', (req, res) => {
  // Opcional: Validar si la cookie auth_token está presente antes de servir la vista
  const token = req.cookies.auth_token;
  if (!token) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corporativo CSMonterrey corriendo en: http://localhost:${PORT}`);
  console.log(`👉 Visita http://localhost:${PORT}/api/setup-db para poblar las tablas con datos de prueba al instante.`);
});
