const bcrypt = require('bcrypt');
const db = require('../../database/connection');

const SALT_ROUNDS = 10;

const usuariosController = {

  async listar(req, res) {
    try {
      const [rows] = await db.query(`
        SELECT
          u.id,
          u.nome,
          u.email,
          u.perfil_id,
          p.nome AS perfil_nome,
          u.ativo,
          u.created_at,
          u.updated_at
        FROM usuarios u
        INNER JOIN perfil p ON p.id = u.perfil_id
        ORDER BY u.id DESC
      `);

      return res.status(200).json({
        success: true,
        mensagem: 'Usuários listados com sucesso',
        data: rows
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        mensagem: 'Erro ao listar usuários',
        error: error.message
      });
    }
  },

    async criar(req, res) {
    try {
      const { nome, email, senha, perfil_id } = req.body;
      const perfilIdNumero = Number(perfil_id);

      if (!nome || !email || !senha || !perfil_id) {
        return res.status(400).json({
          success: false,
          mensagem: 'Campos obrigatórios: nome, email, senha e perfil_id'
        });
      }

      if (isNaN(perfilIdNumero)) {
        return res.status(400).json({
          success: false,
          mensagem: 'perfil_id inválido'
        });
      }

      const [perfilRows] = await db.query(
        'SELECT id FROM perfil WHERE id = ?',
        [perfilIdNumero]
      );

      if (perfilRows.length === 0) {
        return res.status(400).json({
          success: false,
          mensagem: 'perfil_id inexistente'
        });
      }

      const [emailRows] = await db.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );

      if (emailRows.length > 0) {
        return res.status(409).json({
          success: false,
          mensagem: 'Email já cadastrado'
        });
      }

      const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

      const [resultado] = await db.query(
        `INSERT INTO usuarios (nome, email, senha_hash, perfil_id, ativo)
         VALUES (?, ?, ?, ?, 1)`,
        [nome, email, senha_hash, perfilIdNumero]
      );

      return res.status(201).json({
        success: true,
        mensagem: 'Usuário criado com sucesso',
        data: {
          id: resultado.insertId,
          nome,
          email,
          perfil_id: perfilIdNumero,
          ativo: 1
        }
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        mensagem: 'Erro ao criar usuário',
        error: error.message
      });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, senha, perfil_id, ativo } = req.body;

      if (isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          mensagem: 'ID inválido'
        });
      }

      const [usuariosRows] = await db.query(
        'SELECT * FROM usuarios WHERE id = ?',
        [id]
      );

      if (usuariosRows.length === 0) {
        return res.status(404).json({
          success: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      const usuarioAtual = usuariosRows[0];

      const novoNome = nome !== undefined ? nome : usuarioAtual.nome;
      const novoEmail = email !== undefined ? email : usuarioAtual.email;
      const novoPerfilId = perfil_id !== undefined ? Number(perfil_id) : usuarioAtual.perfil_id;
      const novoAtivo = ativo !== undefined ? Number(ativo) : usuarioAtual.ativo;

      if (isNaN(novoPerfilId)) {
        return res.status(400).json({
          success: false,
          mensagem: 'perfil_id inválido'
        });
      }

      if (novoAtivo !== 0 && novoAtivo !== 1) {
        return res.status(400).json({
            success: false,
            mensagem: 'Campo ativo deve ser 0 ou 1'
        });
      }

      const [perfilRows] = await db.query(
        'SELECT id FROM perfil WHERE id = ?',
        [novoPerfilId]
      );

      if (perfilRows.length === 0) {
        return res.status(400).json({
          success: false,
          mensagem: 'perfil_id inexistente'
        });
      }

      const [emailRows] = await db.query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [novoEmail, id]
      );

      if (emailRows.length > 0) {
        return res.status(409).json({
          success: false,
          mensagem: 'Email já cadastrado para outro usuário'
        });
      }

      let novaSenhaHash = usuarioAtual.senha_hash;

      if (senha) {
        novaSenhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
      }

      await db.query(
        `UPDATE usuarios
         SET nome = ?, email = ?, senha_hash = ?, perfil_id = ?, ativo = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [novoNome, novoEmail, novaSenhaHash, novoPerfilId, novoAtivo, id]
      );

      return res.status(200).json({
        success: true,
        mensagem: 'Usuário atualizado com sucesso',
        data: {
          id: Number(id),
          nome: novoNome,
          email: novoEmail,
          perfil_id: novoPerfilId,
          ativo: novoAtivo
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        mensagem: 'Erro ao atualizar usuário',
        error: error.message
      });
    }
  },

  async desativar(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          mensagem: 'ID inválido'
        });
      }

      const [usuariosRows] = await db.query(
        'SELECT id FROM usuarios WHERE id = ?',
        [id]
      );

      if (usuariosRows.length === 0) {
        return res.status(404).json({
          success: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      await db.query(
        `UPDATE usuarios
         SET ativo = 0, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id]
      );

      return res.status(200).json({
        success: true,
        mensagem: 'Usuário desativado com sucesso'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        mensagem: 'Erro ao desativar usuário',
        error: error.message
      });
    }
  }

};

module.exports = usuariosController;