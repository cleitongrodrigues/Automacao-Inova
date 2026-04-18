// src/routes/alunosRoutes.js
// Define os endpoints de alunos e os conecta ao controller.

const express = require('express');
const router = express.Router();

const alunosController = require('../controllers/alunos/alunosController');

router.get('/', alunosController.obterTodos);
router.get('/:id', alunosController.buscarPorId);
router.post('/', alunosController.criar);
router.put('/:id', alunosController.atualizar);
router.delete('/:id', alunosController.remover);

module.exports = router;
