/**
 * Configurações Globais do Sistema
 * 
 * 🔧 IMPORTANTE: Este arquivo centraliza todas as configurações.
 * Modifique aqui para ajustar URLs, intervalos e comportamentos.
 */

const CONFIG = {
  /**
   * Executa frontend com dados mockados.
   * Defina false quando o backend real estiver disponível.
   */
  USE_MOCK_DATA: true,

  /**
   * URL da API do Backend
   * 
   * Desenvolvimento: http://localhost:5000/api
   * Produção: https://sua-api.herokuapp.com/api (ou outro servidor)
   */
  API_URL: 'http://localhost:5000/api',

  /**
   * Configurações do fluxo de presença via QR Code
   */
  PRESENCA: {
    route: '/presenca',
    tokenParam: 'token'
  },
  
  /**
   * Intervalo de Atualização Automática (Polling)
   * 
   * Dashboard atualiza lista de presença automaticamente.
   * Valor em milissegundos (10000 = 10 segundos)
   */
  POLLING_INTERVAL: 10000,  // 10 segundos
  
  /**
   * Timeout de Requisições HTTP
   * 
   * Tempo máximo de espera para requisições ao backend.
   * Valor em milissegundos (30000 = 30 segundos)
   */
  REQUEST_TIMEOUT: 30000,  // 30 segundos
  
  /**
   * Chaves do LocalStorage
   * 
   * Usadas para persistir dados no navegador.
   */
  STORAGE_KEYS: {
    token: 'auth_token',        // Token JWT de autenticação
    user: 'auth_user',          // Dados do usuário logado
    theme: 'app_theme'          // Tema atual (light/dark)
  },
  
  /**
   * Mensagens do Sistema
   */
  MESSAGES: {
    loading: 'Carregando...',
    success: 'Operação realizada com sucesso!',
    error: 'Ocorreu um erro. Tente novamente.',
    unauthorized: 'Você precisa fazer login para acessar esta página.',
    networkError: 'Erro de conexão. Verifique sua internet.'
  },
  
  /**
   * Configurações de Validação
   */
  VALIDATION: {
    cpfLength: 11,
    minPasswordLength: 6,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  /**
   * Configurações da Câmera (Selfie)
   */
  CAMERA: {
    width: 640,
    height: 480,
    facingMode: 'user'  // 'user' = câmera frontal, 'environment' = traseira
  }
};

// Tornar CONFIG disponível globalmente
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
