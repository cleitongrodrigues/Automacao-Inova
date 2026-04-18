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
  },

  // GET /lista-presenca  (dashboard: todos alunos + status hoje)
  async listarPresencas(req, res) {
    try {
      const hoje = dataHojeISO();

      const [presencas] = await db.query(
        `SELECT
           a.id, a.nome, a.cpf, a.matricula, a.email,
           CASE WHEN p.id IS NOT NULL THEN 1 ELSE 0 END AS presente,
           p.data_hora_registro AS hora_registro
         FROM alunos a
         LEFT JOIN presencas p
           ON p.aluno_id = a.id
           AND p.evento_id IN (SELECT id FROM eventos WHERE data = ? AND ativo = 1)
         WHERE a.ativo = 1
         ORDER BY a.nome`,
        [hoje]
      );

      return res.status(200).json({ sucesso: true, presencas });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar presencas', dados: error.message });
    }
  },

  // GET /estatisticas?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
  async obterEstatisticas(req, res) {
    try {
      const hoje = dataHojeISO();
      const dataInicio = req.query.dataInicio || `${new Date().getFullYear()}-01-01`;
      const dataFim = req.query.dataFim || hoje;

      const [totalAlunos] = await db.query('SELECT COUNT(*) AS total FROM alunos WHERE ativo = 1');
      const totalA = totalAlunos[0].total || 0;

      const [eventoRows] = await db.query(
        `SELECT
           e.id, e.data, e.nome,
           COUNT(p.id) AS presentes
         FROM eventos e
         LEFT JOIN presencas p ON p.evento_id = e.id
         WHERE e.data BETWEEN ? AND ?
         GROUP BY e.id
         ORDER BY e.data`,
        [dataInicio, dataFim]
      );

      const eventosPorData = eventoRows.map(e => ({
        data: e.data,
        nome: e.nome,
        presentes: e.presentes,
        ausentes: totalA - e.presentes,
        total: totalA
      }));

      const totalEventos = eventoRows.length;
      const totalPresencas = eventoRows.reduce((s, e) => s + e.presentes, 0);
      const totalPossivel = totalEventos * totalA;
      const mediaPresenca = totalPossivel > 0 ? Math.round((totalPresencas / totalPossivel) * 100) : 0;
      const totalAusencias = totalPossivel - totalPresencas;

      // ranking presentes
      const [rankP] = await db.query(
        `SELECT a.nome, COUNT(p.id) AS presencas,
           ROUND(COUNT(p.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM eventos WHERE data BETWEEN ? AND ?), 0), 1) AS percentual
         FROM alunos a
         JOIN presencas p ON p.aluno_id = a.id
         JOIN eventos e ON e.id = p.evento_id
         WHERE e.data BETWEEN ? AND ? AND a.ativo = 1
         GROUP BY a.id ORDER BY presencas DESC LIMIT 5`,
        [dataInicio, dataFim, dataInicio, dataFim]
      );

      // ranking faltas
      const [rankA] = await db.query(
        `SELECT a.nome,
           (SELECT COUNT(*) FROM eventos WHERE data BETWEEN ? AND ?) - COUNT(p.id) AS faltas,
           ROUND(((SELECT COUNT(*) FROM eventos WHERE data BETWEEN ? AND ?) - COUNT(p.id)) * 100.0
             / NULLIF((SELECT COUNT(*) FROM eventos WHERE data BETWEEN ? AND ?), 0), 1) AS percentual
         FROM alunos a
         LEFT JOIN presencas p ON p.aluno_id = a.id
           AND p.evento_id IN (SELECT id FROM eventos WHERE data BETWEEN ? AND ?)
         WHERE a.ativo = 1
         GROUP BY a.id
         HAVING faltas > 0
         ORDER BY faltas DESC LIMIT 5`,
        [dataInicio, dataFim, dataInicio, dataFim, dataInicio, dataFim, dataInicio, dataFim]
      );

      return res.status(200).json({
        sucesso: true,
        dados: {
          totalEventos,
          totalPresencas,
          mediaPresenca,
          totalAlunos: totalA,
          presentes: totalPresencas,
          ausentes: totalAusencias,
          eventosPorData,
          rankingPresentes: rankP,
          rankingAusentes: rankA
        }
      });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao calcular estatisticas', dados: error.message });
    }
  }
};
