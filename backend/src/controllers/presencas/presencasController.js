const db = require('../../database/connection');

function dataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = {
  // POST /registrar-presenca
  // Body: { token, cpf, email, selfie? }
  async registrar(req, res) {
    try {
      const token = String(req.body.token || '').trim();
      const cpf = String(req.body.cpf || '').replace(/\D/g, '');
      const email = String(req.body.email || '').trim().toLowerCase();
      const selfie = req.body.selfie || null;

      if (!token || !cpf || !email) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Token, CPF e email sao obrigatorios'
        });
      }

      const [eventos] = await db.query(
        'SELECT * FROM eventos WHERE qr_code_token = ? AND ativo = 1 LIMIT 1',
        [token]
      );

      if (eventos.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Evento nao encontrado para este token'
        });
      }

      const evento = eventos[0];
      const hoje = dataHojeISO();
      if (evento.data !== hoje) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'QR Code invalido para a data de hoje'
        });
      }

      const [alunos] = await db.query(
        'SELECT * FROM alunos WHERE cpf = ? AND ativo = 1 LIMIT 1',
        [cpf]
      );

      if (alunos.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Aluno nao encontrado'
        });
      }

      const aluno = alunos[0];
      if (String(aluno.email || '').trim().toLowerCase() !== email) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Email nao corresponde ao cadastro'
        });
      }

      const requerFacial = Number(evento.requer_reconhecimento_facial || 0) === 1;
      if (requerFacial && !selfie) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Selfie obrigatoria para este evento'
        });
      }

      const status = requerFacial ? 'aprovada' : 'aprovada';
      const [insertInfo] = await db.query(
        `INSERT INTO presencas (aluno_id, evento_id, data_hora_registro, status, foto_selfie)
         VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?)`,
        [aluno.id, evento.id, status, selfie]
      );

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Presenca registrada com sucesso',
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          cpf: aluno.cpf,
          email: aluno.email
        },
        presenca: {
          id: insertInfo.insertId,
          status,
          evento_id: evento.id,
          aluno_id: aluno.id
        }
      });
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          sucesso: false,
          mensagem: 'Presenca ja registrada para este aluno no evento'
        });
      }

      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao registrar presenca',
        dados: error.message
      });
    }
  }
};
