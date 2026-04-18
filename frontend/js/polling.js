/**
 * 🔄 POLLING - ATUALIZAÇÃO AUTOMÁTICA
 * 
 * Sistema de atualização automática a cada X segundos.
 * Usado no dashboard para atualizar lista de presença em tempo real.
 */

let pollingIntervals = {};

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
    // Usuário saiu da aba - pausar todos os pollings
    Object.keys(pollingIntervals).forEach(nome => {
      const intervalo = pollingIntervals[nome];
      if (intervalo) {
        clearInterval(intervalo);
        pollingIntervals[nome] = { paused: true, original: intervalo };
      }
    });
    console.log('⏸️ Pollings pausados (aba inativa)');
  } else {
    // Usuário voltou para a aba - retomar pollings
    Object.keys(pollingIntervals).forEach(nome => {
      if (pollingIntervals[nome].paused) {
        // Nota: Para retomar, a página precisará chamar iniciarPolling() novamente
        console.log(`▶️ Polling "${nome}" precisa ser reiniciado`);
      }
    });
  }
});

/**
 * Limpar pollings ao sair da página
 */
window.addEventListener('beforeunload', () => {
  pararTodosPollings();
});
