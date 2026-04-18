// src/controllers/alunos/alunosController.js
// Contem toda a logica de negocio dos alunos.
// Cada funcao e chamada pela rota correspondente.

const db = require('../../database/connection');

module.exports = {

  // GET /alunos - retorna todos os alunos ativos
  async obterTodos(req, res) {
    try {
      const sql = 'SELECT * FROM alunos WHERE ativo = 1 ORDER BY nome';
      const [rows] = await db.query(sql);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Alunos listados com sucesso',
        dados: rows,
        nItens: rows.length,
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar alunos',
        dados: error.message,
      });
    }
  },

  // GET /alunos/:id - retorna um aluno pelo ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const sql = 'SELECT * FROM alunos WHERE id = ? AND ativo = 1';
      const [rows] = await db.query(sql, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Aluno nao encontrado',
        });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Aluno encontrado',
        dados: rows[0],
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar aluno',
        dados: error.message,
      });
    }
  },

  // POST /alunos - cria um novo aluno
  // Body: { nome, cpf, matricula, email, telefone, empresa, foto_cadastro }
  async criar(req, res) {
    try {
      const { nome, cpf, matricula, email, telefone, empresa, foto_cadastro } = req.body;

      if (!nome || !cpf || !email) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Nome, CPF e email sao obrigatorios',
        });
      }

      const sql = `
        INSERT INTO alunos (nome, cpf, matricula, email, telefone, empresa, foto_cadastro)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        nome,
        cpf,
        matricula || null,
        email,
        telefone || null,
        empresa || null,
        foto_cadastro || null,
      ]);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Aluno criado com sucesso',
        dados: {
          id: result.insertId,
          nome,
          cpf,
          matricula: matricula || null,
          email,
          telefone: telefone || null,
          empresa: empresa || null,
          foto_cadastro: foto_cadastro || null,
        },
      });
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          sucesso: false,
          mensagem: 'CPF ou matricula ja cadastrados',
        });
      }

      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao criar aluno',
        dados: error.message,
      });
    }
  },

  // PUT /alunos/:id - atualiza um aluno existente
  // Body: { nome, cpf, matricula, email, telefone, empresa, foto_cadastro }
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, cpf, matricula, email, telefone, empresa, foto_cadastro } = req.body;

      if (!nome || !cpf || !email) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Nome, CPF e email sao obrigatorios',
        });
      }

      const sql = `
        UPDATE alunos
           SET nome = ?,
               cpf = ?,
               matricula = ?,
               email = ?,
               telefone = ?,
               empresa = ?,
            foto_cadastro = COALESCE(?, foto_cadastro),
               updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND ativo = 1
      `;
      const [result] = await db.query(sql, [
        nome,
        cpf,
        matricula || null,
        email,
        telefone || null,
        empresa || null,
        foto_cadastro || null,
        id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Aluno nao encontrado',
        });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Aluno atualizado com sucesso',
        dados: {
          id: Number(id),
          nome,
          cpf,
          matricula: matricula || null,
          email,
          telefone: telefone || null,
          empresa: empresa || null,
          foto_cadastro: foto_cadastro || null,
        },
      });
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          sucesso: false,
          mensagem: 'CPF ou matricula ja cadastrados',
        });
      }

      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar aluno',
        dados: error.message,
      });
    }
  },

  // DELETE /alunos/:id - desativa um aluno (soft delete)
  async remover(req, res) {
    try {
      const { id } = req.params;
      const sql = `
        UPDATE alunos
           SET ativo = 0,
               updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND ativo = 1
      `;
      const [result] = await db.query(sql, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Aluno nao encontrado',
        });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Aluno removido com sucesso',
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao remover aluno',
        dados: error.message,
      });
    }
  },
};
