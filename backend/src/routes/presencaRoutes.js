const express = require('express');
const router = express.Router();

const eventosController = require('../controllers/eventos/eventosController');
const presencasController = require('../controllers/presencas/presencasController');

router.get('/evento-atual', eventosController.obterEventoAtual);
router.post('/registrar-presenca', presencasController.registrar);

module.exports = router;
