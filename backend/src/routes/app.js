// src/routes/app.js
// Roteador principal - registra todas as rotas da aplicacao em um unico lugar.

const express = require('express');
const router = express.Router();

const alunosRoutes = require('./alunosRoutes');

router.use('/alunos', alunosRoutes);

module.exports = router;
