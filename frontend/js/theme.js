/**
 * 🌓 MODO CLARO/ESCURO
 * 
 * Sistema de alternância entre tema claro e escuro.
 * Persiste a escolha do usuário no localStorage.
 */

/**
 * Inicializa o sistema de temas
 */
function inicializarTema() {
  // Buscar tema salvo ou usar 'light' como padrão
  const temaSalvo = buscarStorage(CONFIG.STORAGE_KEYS.theme) || 'light';
  aplicarTema(temaSalvo);
  
  // Configurar botão de toggle (se existir)
  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', alternarTema);
    atualizarIconeTema(temaSalvo);
  }
}

/**
 * Aplica o tema (light ou dark)
 */
function aplicarTema(tema) {
  const html = document.documentElement;
  html.setAttribute('data-theme', tema);
  salvarStorage(CONFIG.STORAGE_KEYS.theme, tema);
}

/**
 * Alterna entre claro e escuro
 */
function alternarTema() {
  const html = document.documentElement;
  const temaAtual = html.getAttribute('data-theme') || 'light';
  const novoTema = temaAtual === 'light' ? 'dark' : 'light';
  
  aplicarTema(novoTema);
  atualizarIconeTema(novoTema);
  
  // Feedback visual
  mostrarMensagem('info', `Modo ${novoTema === 'light' ? 'Claro' : 'Escuro'} ativado`, 2000);
}

/**
 * Atualiza ícone do botão de tema
 */
function atualizarIconeTema(tema) {
  const toggleButton = document.getElementById('theme-toggle');
  if (!toggleButton) return;
  
  if (tema === 'light') {
    toggleButton.innerHTML = '🌙'; // Lua = trocar para escuro
    toggleButton.title = 'Ativar modo escuro';
  } else {
    toggleButton.innerHTML = '☀️'; // Sol = trocar para claro
    toggleButton.title = 'Ativar modo claro';
  }
}

/**
 * Retorna o tema atual
 */
function obterTemaAtual() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

// Inicializar quando DOM carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarTema);
} else {
  inicializarTema();
}
