/**
 * 🔄 POLLING - ATUALIZAÇÃO AUTOMÁTICA
 * 
 * Sistema de atualização automática a cada X segundos.
 * Usado no dashboard para atualizar lista de presença em tempo real.
 */

let pollingIntervals = {};
let pollingPausado = false;

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
  console.log('🛑 Todos os pollings foram parados');
}

/**
 * Verifica se polling está ativo
 */
function pollingEstaAtivo(nome) {
  return !!pollingIntervals[nome];
}

/**
 * Pausar polling quando usuário sai da aba (economia de recursos)
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!pollingPausado) {
      pararTodosPollings();
      pollingPausado = true;
      console.log('⏸️ Pollings pausados (aba inativa)');
    }
  } else {
    pollingPausado = false;
  }
});

/**
 * Limpar pollings ao sair da página
 */
window.addEventListener('beforeunload', () => {
  pararTodosPollings();
});
