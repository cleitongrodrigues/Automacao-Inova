const express = require('express');
const router = express.Router();

const eventosController = require('../controllers/eventos/eventosController');

router.get('/', eventosController.listar);
router.post('/', eventosController.criar);
router.put('/:id', eventosController.atualizar);
router.patch('/:id/toggle', eventosController.toggleStatus);

module.exports = router;
