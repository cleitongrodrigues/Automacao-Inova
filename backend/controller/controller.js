// src/controllers/autores/autoresController.js
// Contém toda a lógica de negócio dos autores.
// Cada função é chamada pela rota correspondente.

const db = require('../../database/connection');

module.exports = {

  // GET /autores — retorna todos os autores
  async obterTodos(req, res) {
    try {
      const sql = 'SELECT * FROM autores ORDER BY nome';
      const [rows] = await db.query(sql);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Autores listados com sucesso',
        dados: rows,
        nItens: rows.length,
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar autores',
        dados: error.message,
      });
    }
  },

  // GET /autores/:id — retorna um autor pelo ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const sql = 'SELECT * FROM autores WHERE id = ?';
      const [rows] = await db.query(sql, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Autor não encontrado',
        });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Autor encontrado',
        dados: rows[0],
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar autor',
        dados: error.message,
      });
    }
  },

  // POST /autores — cria um novo autor
  // Body: { nome, nacionalidade }
  async criar(req, res) {
    try {
      const { nome, nacionalidade } = req.body;

      if (!nome || !nacionalidade) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Nome e nacionalidade são obrigatórios',
        });
      }

      const sql = 'INSERT INTO autores (nome, nacionalidade) VALUES (?, ?)';
      const [result] = await db.query(sql, [nome, nacionalidade]);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Autor criado com sucesso',
        dados: { id: result.insertId, nome, nacionalidade },
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao criar autor',
        dados: error.message,
      });
    }
  },

  // PUT /autores/:id — atualiza um autor existente
  // Body: { nome, nacionalidade }
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, nacionalidade } = req.body;

      if (!nome || !nacionalidade) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Nome e nacionalidade são obrigatórios',
        });
      }

      const sql = 'UPDATE autores SET nome = ?, nacionalidade = ? WHERE id = ?';
      const [result] = await db.query(sql, [nome, nacionalidade, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Autor não encontrado',
        });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Autor atualizado com sucesso',
        dados: { id: Number(id), nome, nacionalidade },
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar autor',
        dados: error.message,
      });
    }
  },

  // DELETE /autores/:id — remove um autor (e seus livros via ON DELETE CASCADE)
  async remover(req, res) {
    try {
      const { id } = req.params;
      const sql = 'DELETE FROM autores WHERE id = ?';
      const [result] = await db.query(sql, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Autor não encontrado',
        });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Autor removido com sucesso',
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao remover autor',
        dados: error.message,
      });
    }
  },
};