// src/routes/autoresRoutes.js
// Define os endpoints de autores e os conecta ao controller.

const express = require('express');
const router  = express.Router();

const autoresController = require('../controllers/autores/autoresController');

router.get('/',     autoresController.obterTodos);
router.get('/:id',  autoresController.buscarPorId);
router.post('/',    autoresController.criar);
router.put('/:id',  autoresController.atualizar);
router.delete('/:id', autoresController.remover);

module.exports = router;