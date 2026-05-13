const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

// Importar configuración y enrutadores en español
const pool = require('./configuracion/base_datos');
const autenticacionRutas = require('./rutas/autenticacionRutas');
const consultaRutas = require('./rutas/consultaRutas');

const aplicacion = express();
const PUERTO = 3000;

// Configuración de Middlewares
aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: true }));
aplicacion.use(cookieParser());

// Servir la carpeta estática pública en español
aplicacion.use(express.static(path.join(__dirname, 'publico')));

// =========================================================================
// RUTAS DE LA API REST
// =========================================================================
aplicacion.use('/api/autenticacion', autenticacionRutas);
aplicacion.use('/api/consultas', consultaRutas);

// =========================================================================
// RUTAS DE VISTAS HTML
// =========================================================================

// Página de inicio de bienvenida
aplicacion.get('/', (req, res) => {
  if (req.cookies.token_acceso) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'vistas', 'index.html'));
});

// Página de inicio de sesión
aplicacion.get('/login', (req, res) => {
  if (req.cookies.token_acceso) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'vistas', 'login.html'));
});

// Página de registro de administradores
aplicacion.get('/registro', (req, res) => {
  if (req.cookies.token_acceso) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'vistas', 'registro.html'));
});

// Página del Dashboard Resumen (Aparte)
aplicacion.get('/dashboard', (req, res) => {
  const token = req.cookies.token_acceso;
  if (!token) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'vistas', 'dashboard.html'));
});

// Página de Consultas Corporativas y PDF (Aparte)
aplicacion.get('/consultas', (req, res) => {
  const token = req.cookies.token_acceso;
  if (!token) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'vistas', 'consultas.html'));
});

// Fallback para rutas no encontradas
aplicacion.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'vistas', 'index.html'));
});

// Inicializar el servidor en el puerto especificado
aplicacion.listen(PUERTO, () => {
  console.log(`🚀 Servidor corporativo CSMonterrey corriendo en: http://localhost:${PUERTO}`);
  console.log(`👉 Rutas activas: / (Inicio), /login, /registro, /dashboard, /consultas`);
});
