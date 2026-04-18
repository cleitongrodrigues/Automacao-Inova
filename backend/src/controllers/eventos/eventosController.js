const db = require('../../database/connection');

function dataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function gerarTokenFallback() {
  return `QR-${Date.now()}`;
}

module.exports = {
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
