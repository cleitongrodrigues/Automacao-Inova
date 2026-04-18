/**
 * 📡 API - COMUNICAÇÃO COM BACKEND
 * 
 * Todas as chamadas HTTP para o backend centralizadas neste arquivo.
 * Usa fetch() para fazer requisições REST.
 * 
 * ⚠️ IMPORTANTE: Backend valida tudo! Frontend só faz validações de UX.
 */

async function requisicaoJSON(url, options = {}, requerAuth = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

  try {
    const resposta = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    if (requerAuth && resposta.status === 401) {
      verificarTokenExpirado(resposta);
    }

    let dados = null;
    try {
      dados = await resposta.json();
    } catch (erroJson) {
      dados = null;
    }

    if (!resposta.ok) {
      return {
        success: false,
        sucesso: false,
        mensagem: dados?.mensagem || dados?.message || `Erro HTTP ${resposta.status}`,
        status: resposta.status,
        dados
      };
    }

    if (dados && typeof dados === 'object') {
      if (!('success' in dados) && !('sucesso' in dados)) {
        dados.success = true;
      }
      return dados;
    }

    return {
      success: true,
      sucesso: true,
      dados: dados
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        sucesso: false,
        mensagem: 'Tempo limite excedido na requisicao. Tente novamente.',
        timeout: true
      };
    }

    return {
      success: false,
      sucesso: false,
      mensagem: 'Falha de conexao com a API. Verifique se o backend esta ativo.',
      erroTecnico: error.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

const API = {
  
  /**
   * ==========================================
   * AUTENTICAÇÃO
   * ==========================================
   */
  
  /**
   * Login de administrador
   */
  async login(email, senha) {
    return requisicaoJSON(`${CONFIG.API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
  },
  
  /**
   * Logout
   */
  async logout() {
    return requisicaoJSON(`${CONFIG.API_URL}/logout`, {
      method: 'POST',
      headers: obterHeadersAutenticados()
    }, true);
  },
  
  
  /**
   * ==========================================
   * PRESENÇA
   * ==========================================
   */
  
  /**
   * Registra presença de aluno (público)
   */
  async registrarPresenca(dados) {
    return requisicaoJSON(`${CONFIG.API_URL}/registrar-presenca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
  },
  
  /**
   * Lista presença do dia (admin)
   */
  async listarPresencas() {
    return requisicaoJSON(`${CONFIG.API_URL}/lista-presenca`, {
      headers: obterHeadersAutenticados()
    }, true);
  },
  
  /**
   * Aprovar presença manualmente (admin)
   */
  async aprovarPresenca(id) {
    return requisicaoJSON(`${CONFIG.API_URL}/presencas/${id}/aprovar`, {
      method: 'POST',
      headers: obterHeadersAutenticados()
    }, true);
  },
  
  /**
   * Rejeitar presença (admin)
   */
  async rejeitarPresenca(id, motivo) {
    return requisicaoJSON(`${CONFIG.API_URL}/presencas/${id}/rejeitar`, {
      method: 'POST',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify({ motivo })
    }, true);
  },
  
  
  /**
   * ==========================================
   * ALUNOS (CRUD)
   * ==========================================
   */
  
  /**
   * Listar todos os alunos
   */
  async listarAlunos() {
    return requisicaoJSON(`${CONFIG.API_URL}/alunos`, {
      headers: obterHeadersAutenticados()
    }, true);
  },
  
  /**
   * Buscar aluno por ID
   */
  async buscarAluno(id) {
    return requisicaoJSON(`${CONFIG.API_URL}/alunos/${id}`, {
      headers: obterHeadersAutenticados()
    }, true);
  },
  
  /**
   * Criar novo aluno
   */
  async criarAluno(dados) {
    return requisicaoJSON(`${CONFIG.API_URL}/alunos`, {
      method: 'POST',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify(dados)
    }, true);
  },
  
  /**
   * Atualizar aluno existente
   */
  async atualizarAluno(id, dados) {
    return requisicaoJSON(`${CONFIG.API_URL}/alunos/${id}`, {
      method: 'PUT',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify(dados)
    }, true);
  },
  
  /**
   * Remover aluno (soft delete)
   */
  async removerAluno(id) {
    return requisicaoJSON(`${CONFIG.API_URL}/alunos/${id}`, {
      method: 'DELETE',
      headers: obterHeadersAutenticados()
    }, true);
  },
  
  
  /**
   * ==========================================
   * EVENTOS
   * ==========================================
   */
  
  /**
   * Obter evento atual (do sábado)
   */
  async eventoAtual() {
    return requisicaoJSON(`${CONFIG.API_URL}/evento-atual`);
  },

  /**
   * Validar token recebido no QR Code
   */
  async validarEventoPorToken(token) {
    const params = new URLSearchParams({ token });
    return requisicaoJSON(`${CONFIG.API_URL}/evento-atual?${params}`);
  },

  /**
   * Buscar configuração de um evento
   */
  async obterConfigEvento(id) {
    return requisicaoJSON(`${CONFIG.API_URL}/eventos/${id}/config`);
  },
  
  /**
   * Listar todos os eventos
   */
  async listarEventos() {
    return requisicaoJSON(`${CONFIG.API_URL}/eventos`, {
      headers: obterHeadersAutenticados()
    }, true);
  },
  
  /**
   * Criar novo evento
   */
  async criarEvento(dados) {
    return requisicaoJSON(`${CONFIG.API_URL}/eventos`, {
      method: 'POST',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify(dados)
    }, true);
  },
  
  /**
   * Atualizar evento
   */
  async atualizarEvento(id, dados) {
    return requisicaoJSON(`${CONFIG.API_URL}/eventos/${id}`, {
      method: 'PUT',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify(dados)
    }, true);
  },
  
  /**
   * Gerar QR Code para evento
   */
  async gerarQRCode() {
    return requisicaoJSON(`${CONFIG.API_URL}/qrcode/gerar`, {
      headers: obterHeadersAutenticados()
    }, true);
  },
  
  
  /**
   * ==========================================
   * ESTATÍSTICAS E RELATÓRIOS
   * ==========================================
   */
  
  /**
   * Obter estatísticas gerais
   */
  async obterEstatisticas(filtros = {}) {
    const params = new URLSearchParams(filtros);
    return requisicaoJSON(`${CONFIG.API_URL}/estatisticas?${params}`, {
      headers: obterHeadersAutenticados()
    }, true);
  },
  
  /**
   * Obter histórico de presenças
   */
  async obterHistorico(filtros = {}) {
    const params = new URLSearchParams(filtros);
    return requisicaoJSON(`${CONFIG.API_URL}/relatorios?${params}`, {
      headers: obterHeadersAutenticados()
    }, true);
  },
  
  
  /**
   * ==========================================
   * UPLOAD DE ARQUIVOS
   * ==========================================
   */
  
  /**
   * Upload de foto (base64)
   */
  async uploadFoto(fotoBase64, tipo = 'aluno') {
    return requisicaoJSON(`${CONFIG.API_URL}/upload/foto`, {
      method: 'POST',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify({ foto: fotoBase64, tipo })
    }, true);
  }
  
};

/**
 * Helper para converter File em Base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
