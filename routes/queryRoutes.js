const express = require('express');
const QueryController = require('../controllers/queryController');
const router = express.Router();

// Ruta dinámica para obtener los datos de la consulta solicitada (1 al 10)
router.get('/:id', QueryController.executeQuery);

module.exports = router;
