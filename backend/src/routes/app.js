// src/routes/app.js
// Roteador principal - registra todas as rotas da aplicacao em um unico lugar.

const express = require('express');
const router = express.Router();

const alunosRoutes = require('./alunosRoutes');
const presencaRoutes = require('./presencaRoutes');

router.use('/alunos', alunosRoutes);
router.use('/', presencaRoutes);

module.exports = router;
