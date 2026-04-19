// src/routes/app.js
// Roteador principal - registra todas as rotas da aplicacao em um unico lugar.

const express = require('express');
const router = express.Router();

const alunosRoutes = require('./alunosRoutes');
const presencaRoutes = require('./presencaRoutes');
const eventosRoutes = require('./eventosRoutes');
const usuariosRoutes = require('./usuariosRoutes');

router.use('/alunos', alunosRoutes);
router.use('/eventos', eventosRoutes);
router.use('/', presencaRoutes);
router.use('/usuarios', usuariosRoutes);

module.exports = router;
