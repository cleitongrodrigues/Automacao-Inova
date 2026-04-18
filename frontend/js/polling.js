/**
 * 🔄 POLLING - ATUALIZAÇÃO AUTOMÁTICA
 * 
 * Sistema de atualização automática a cada X segundos.
 * Usado no dashboard para atualizar lista de presença em tempo real.
 */

let pollingIntervals = {};
let pollingConfigs = {}; // guarda nome → { callback, intervalo } para reiniciar

/**
 * Inicia polling
 * @param {string} nome - Nome identificador único do polling
 * @param {Function} callback - Função a ser executada repetidamente
 * @param {number} intervalo - Intervalo em ms (padrão: 10 segundos)
 */
function iniciarPolling(nome, callback, intervalo = CONFIG.POLLING_INTERVAL) {
  // Parar se já existe
  if (pollingIntervals[nome]) {
    pararPolling(nome);
  }

  // Salvar configuração para poder reiniciar após visibilitychange
  pollingConfigs[nome] = { callback, intervalo };
  
  // Executar imediatamente
  callback();
  
  // Executar repetidamente
  pollingIntervals[nome] = setInterval(callback, intervalo);
  
  console.log(`✅ Polling "${nome}" iniciado (${intervalo}ms)`);
}

/**
 * Para polling específico
 */
function pararPolling(nome) {
  if (pollingIntervals[nome]) {
    clearInterval(pollingIntervals[nome]);
    delete pollingIntervals[nome];
    console.log(`🛑 Polling "${nome}" parado`);
  }
}

/**
 * Para todos os pollings ativos
 */
function pararTodosPollings() {
  Object.keys(pollingIntervals).forEach(nome => {
    clearInterval(pollingIntervals[nome]);
  });
  pollingIntervals = {};
  pollingConfigs = {};
  console.log('🛑 Todos os pollings foram parados');
}

/**
 * Verifica se polling está ativo
 */
function pollingEstaAtivo(nome) {
  return !!pollingIntervals[nome];
}

/**
 * Ao voltar para a aba, executa os callbacks imediatamente para atualizar sem esperar o intervalo
 */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    Object.values(pollingConfigs).forEach(({ callback }) => callback());
  }
});

/**
 * Limpar pollings ao sair da página
 */
window.addEventListener('beforeunload', () => {
  pararTodosPollings();
});
