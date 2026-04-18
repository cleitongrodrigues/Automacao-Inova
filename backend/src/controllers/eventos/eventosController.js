const db = require('../../database/connection');

function dataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function gerarToken() {
  return `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

module.exports = {
  // GET /eventos
  async listar(req, res) {
    try {
      const [eventos] = await db.query(
        'SELECT * FROM eventos ORDER BY data DESC, id DESC'
      );
      return res.status(200).json({ sucesso: true, eventos });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar eventos', dados: error.message });
    }
  },

  // POST /eventos
  async criar(req, res) {
    try {
      const { nome, data, horario_inicio, horario_fim, requer_reconhecimento_facial, descricao } = req.body;

      if (!nome || !data) {
        return res.status(400).json({ sucesso: false, mensagem: 'Nome e data sao obrigatorios' });
      }

      const token = gerarToken();
      const requerFacial = requer_reconhecimento_facial ? 1 : 0;

      await db.query(
        `INSERT INTO eventos (nome, data, horario_inicio, horario_fim, qr_code_token, requer_reconhecimento_facial, ativo)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [nome, data, horario_inicio || '08:00', horario_fim || '12:00', token, requerFacial]
      );

      const [novoEvento] = await db.query(
        'SELECT * FROM eventos WHERE qr_code_token = ? LIMIT 1',
        [token]
      );

      return res.status(201).json({ sucesso: true, mensagem: 'Evento criado com sucesso', evento: novoEvento[0] });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar evento', dados: error.message });
    }
  },

  // PUT /eventos/:id
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, data, horario_inicio, horario_fim, requer_reconhecimento_facial, descricao } = req.body;

      if (!nome || !data) {
        return res.status(400).json({ sucesso: false, mensagem: 'Nome e data sao obrigatorios' });
      }

      const requerFacial = requer_reconhecimento_facial ? 1 : 0;

      await db.query(
        `UPDATE eventos SET nome = ?, data = ?, horario_inicio = ?, horario_fim = ?, requer_reconhecimento_facial = ?
         WHERE id = ?`,
        [nome, data, horario_inicio || '08:00', horario_fim || '12:00', requerFacial, id]
      );

      const [evento] = await db.query('SELECT * FROM eventos WHERE id = ? LIMIT 1', [id]);

      if (evento.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Evento nao encontrado' });
      }

      return res.status(200).json({ sucesso: true, mensagem: 'Evento atualizado', evento: evento[0] });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar evento', dados: error.message });
    }
  },

  // PATCH /eventos/:id/toggle
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;

      const [eventos] = await db.query('SELECT * FROM eventos WHERE id = ? LIMIT 1', [id]);
      if (eventos.length === 0) {
        return res.status(404).json({ sucesso: false, mensagem: 'Evento nao encontrado' });
      }

      const novoStatus = eventos[0].ativo ? 0 : 1;
      await db.query('UPDATE eventos SET ativo = ? WHERE id = ?', [novoStatus, id]);

      return res.status(200).json({
        sucesso: true,
        mensagem: `Evento ${novoStatus ? 'ativado' : 'desativado'}`,
        ativo: novoStatus === 1
      });
    } catch (error) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao alterar status', dados: error.message });
    }
  },


  // GET /evento-atual?token=XYZ
  async obterEventoAtual(req, res) {
    try {
      const tokenRecebido = String(req.query.token || '').trim();
      const hoje = dataHojeISO();

      // Quando vier token, tentamos buscar e, se nao existir, criamos evento de simulacao para hoje.
      if (tokenRecebido) {
        const [eventoPorToken] = await db.query(
          'SELECT * FROM eventos WHERE qr_code_token = ? AND ativo = 1 LIMIT 1',
          [tokenRecebido]
        );

        if (eventoPorToken.length > 0) {
          return res.status(200).json({
            sucesso: true,
            evento: eventoPorToken[0]
          });
        }

        const nome = 'Simulacao Presenca QR';
        await db.query(
          `INSERT INTO eventos (nome, data, qr_code_token, horario_inicio, horario_fim, requer_reconhecimento_facial, ativo)
           VALUES (?, ?, ?, '08:00', '12:00', 1, 1)`,
          [nome, hoje, tokenRecebido]
        );

        const [novoEvento] = await db.query(
          'SELECT * FROM eventos WHERE qr_code_token = ? LIMIT 1',
          [tokenRecebido]
        );

        return res.status(200).json({
          sucesso: true,
          evento: novoEvento[0]
        });
      }

      // Sem token: retorna evento ativo de hoje, ou cria um padrao.
      const [eventoHoje] = await db.query(
        'SELECT * FROM eventos WHERE data = ? AND ativo = 1 ORDER BY id DESC LIMIT 1',
        [hoje]
      );

      if (eventoHoje.length > 0) {
        return res.status(200).json({
          sucesso: true,
          evento: eventoHoje[0]
        });
      }

      const tokenGerado = gerarTokenFallback();
      await db.query(
        `INSERT INTO eventos (nome, data, qr_code_token, horario_inicio, horario_fim, requer_reconhecimento_facial, ativo)
         VALUES (?, ?, ?, '08:00', '12:00', 1, 1)`,
        ['Evento Padrao Hoje', hoje, tokenGerado]
      );

      const [eventoCriado] = await db.query(
        'SELECT * FROM eventos WHERE qr_code_token = ? LIMIT 1',
        [tokenGerado]
      );

      return res.status(200).json({
        sucesso: true,
        evento: eventoCriado[0]
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao consultar evento atual',
        dados: error.message
      });
    }
  }
};
