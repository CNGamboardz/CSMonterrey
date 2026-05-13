const express = require('express');
const ConsultaControlador = require('../controladores/consultaControlador');
const enrutador = express.Router();

// Ruta para invocar la vista solicitada por su ID numérico
enrutador.get('/:id', ConsultaControlador.ejecutarConsulta);

module.exports = enrutador;
