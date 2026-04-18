// src/routes/app.js
// Roteador principal — registra todas as rotas da aplicação num único lugar.
// O server.js importa este arquivo e o monta no Express.

const express = require('express');
const router  = express.Router();

const autoresRoutes = require('./autoresRoutes');
const livrosRoutes  = require('./livrosRoutes');

router.use('/autores', autoresRoutes);
router.use('/livros',  livrosRoutes);

module.exports = router;