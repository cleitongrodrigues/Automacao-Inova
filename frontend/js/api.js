/**
 * 📡 API - COMUNICAÇÃO COM BACKEND
 * 
 * Todas as chamadas HTTP para o backend centralizadas neste arquivo.
 * Usa fetch() para fazer requisições REST.
 * 
 * ⚠️ IMPORTANTE: Backend valida tudo! Frontend só faz validações de UX.
 */

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
    const response = await fetch(`${CONFIG.API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    return response.json();
  },
  
  /**
   * Logout
   */
  async logout() {
    const response = await fetch(`${CONFIG.API_URL}/logout`, {
      method: 'POST',
      headers: obterHeadersAutenticados()
    });
    return response.json();
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
    const response = await fetch(`${CONFIG.API_URL}/registrar-presenca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Lista presença do dia (admin)
   */
  async listarPresencas() {
    const response = await fetch(`${CONFIG.API_URL}/lista-presenca`, {
      headers: obterHeadersAutenticados()
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Aprovar presença manualmente (admin)
   */
  async aprovarPresenca(id) {
    const response = await fetch(`${CONFIG.API_URL}/presencas/${id}/aprovar`, {
      method: 'POST',
      headers: obterHeadersAutenticados()
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Rejeitar presença (admin)
   */
  async rejeitarPresenca(id, motivo) {
    const response = await fetch(`${CONFIG.API_URL}/presencas/${id}/rejeitar`, {
      method: 'POST',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify({ motivo })
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
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
    const response = await fetch(`${CONFIG.API_URL}/alunos`, {
      headers: obterHeadersAutenticados()
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Buscar aluno por ID
   */
  async buscarAluno(id) {
    const response = await fetch(`${CONFIG.API_URL}/alunos/${id}`, {
      headers: obterHeadersAutenticados()
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Criar novo aluno
   */
  async criarAluno(dados) {
    const response = await fetch(`${CONFIG.API_URL}/alunos`, {
      method: 'POST',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify(dados)
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Atualizar aluno existente
   */
  async atualizarAluno(id, dados) {
    const response = await fetch(`${CONFIG.API_URL}/alunos/${id}`, {
      method: 'PUT',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify(dados)
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Remover aluno (soft delete)
   */
  async removerAluno(id) {
    const response = await fetch(`${CONFIG.API_URL}/alunos/${id}`, {
      method: 'DELETE',
      headers: obterHeadersAutenticados()
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
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
    const response = await fetch(`${CONFIG.API_URL}/evento-atual`);
    return response.json();
  },

  /**
   * Validar token recebido no QR Code
   */
  async validarEventoPorToken(token) {
    const params = new URLSearchParams({ token });
    const response = await fetch(`${CONFIG.API_URL}/evento-atual?${params}`);
    return response.json();
  },

  /**
   * Buscar configuração de um evento
   */
  async obterConfigEvento(id) {
    const response = await fetch(`${CONFIG.API_URL}/eventos/${id}/config`);
    return response.json();
  },
  
  /**
   * Listar todos os eventos
   */
  async listarEventos() {
    const response = await fetch(`${CONFIG.API_URL}/eventos`, {
      headers: obterHeadersAutenticados()
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Criar novo evento
   */
  async criarEvento(dados) {
    const response = await fetch(`${CONFIG.API_URL}/eventos`, {
      method: 'POST',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify(dados)
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Atualizar evento
   */
  async atualizarEvento(id, dados) {
    const response = await fetch(`${CONFIG.API_URL}/eventos/${id}`, {
      method: 'PUT',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify(dados)
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Gerar QR Code para evento
   */
  async gerarQRCode() {
    const response = await fetch(`${CONFIG.API_URL}/qrcode/gerar`, {
      headers: obterHeadersAutenticados()
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
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
    const response = await fetch(`${CONFIG.API_URL}/estatisticas?${params}`, {
      headers: obterHeadersAutenticados()
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
  },
  
  /**
   * Obter histórico de presenças
   */
  async obterHistorico(filtros = {}) {
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${CONFIG.API_URL}/relatorios?${params}`, {
      headers: obterHeadersAutenticados()
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
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
    const response = await fetch(`${CONFIG.API_URL}/upload/foto`, {
      method: 'POST',
      headers: obterHeadersAutenticados(),
      body: JSON.stringify({ foto: fotoBase64, tipo })
    });
    
    if (response.status === 401) verificarTokenExpirado(response);
    return response.json();
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
