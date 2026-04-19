//Define as rotas do módulo usuário

//Importa o Express
const express = require('express');
//Cria um roteador para organziar as rotas do usuário
const router = express.Router();

//Importa o controller que ai conter as funções
const usuariosController = require('../controllers/usuarios/usuariosController');

//Define as funções 
router.get('/', usuariosController.listar);
router.post('/', usuariosController.criar);
router.put('/:id', usuariosController.atualizar);
router.delete('/:id', usuariosController.desativar);

module.exports = router;