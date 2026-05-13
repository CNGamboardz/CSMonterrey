const express = require('express');
const AutenticacionControlador = require('../controladores/autenticacionControlador');
const enrutador = express.Router();

// Rutas para login, registro y logout
enrutador.post('/login', AutenticacionControlador.iniciarSesion);
enrutador.post('/registro', AutenticacionControlador.registrar);
enrutador.get('/salir', AutenticacionControlador.cerrarSesion);
enrutador.post('/salir', AutenticacionControlador.cerrarSesion);

module.exports = enrutador;
