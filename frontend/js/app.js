/**
 * 🚀 APP - INICIALIZAÇÃO E ROTEAMENTO
 * 
 * Arquivo principal da aplicação SPA.
 * Gerencia navegação entre páginas e inicialização de recursos.
 */

/**
 * Rotas da aplicação
 * Formato: '/rota': 'caminho/arquivo.html'
 */
const ROTAS = {
  '/': 'pages/dashboard.html',
  '/login': 'pages/login.html',
  '/dashboard': 'pages/dashboard.html',
  '/alunos': 'pages/alunos.html',
  '/eventos': 'pages/eventos.html',
  '/presenca': 'pages/presenca.html',
  '/estatisticas': 'pages/estatisticas.html'
};

/**
 * Rotas protegidas (requerem autenticação)
 */
const ROTAS_PROTEGIDAS = [
  '/',
  '/dashboard',
  '/alunos',
  '/eventos',
  '/estatisticas'
];

/**
 * Container onde as páginas serão carregadas
 */
const appContainer = document.getElementById('app');

/**
 * Carrega página baseada na rota
 */
async function carregarPagina(rota) {
  // Normalizar rota
  rota = rota || '/';
  
  // Verificar se rota existe
  if (!ROTAS[rota]) {
    mostrarPagina404();
    return;
  }
  
  // Verificar autenticação para rotas protegidas
  if (ROTAS_PROTEGIDAS.includes(rota) && !estaAutenticado()) {
    window.location.hash = '#/login';
    return;
  }
  
  // Redirecionar para dashboard se tentar acessar login já autenticado
  if (rota === '/login' && estaAutenticado()) {
    window.location.hash = '#/dashboard';
    return;
  }
  
  try {
    mostrarLoading();
    
    // Parar todos os pollings antes de trocar de página
    pararTodosPollings();
    
    // Buscar conteúdo da página
    const response = await fetch(ROTAS[rota]);
    
    if (!response.ok) {
      throw new Error('Página não encontrada');
    }
    
    const html = await response.text();
    
    // Injetar conteúdo no container
    appContainer.innerHTML = html;
    
    // Executar scripts da página (se houver)
    await executarScriptsPagina();
    
    // Atualizar navegação ativa
    atualizarNavegacaoAtiva(rota);
    
    // Scroll para o topo
    window.scrollTo(0, 0);
    
    esconderLoading();
  } catch (error) {
    console.error('Erro ao carregar página:', error);
    mostrarPagina404();
    esconderLoading();
  }
}

/**
 * Executa scripts inline da página carregada
 */
async function executarScriptsPagina() {
  const scripts = appContainer.querySelectorAll('script');

  for (const scriptAntigo of scripts) {
    const scriptNovo = document.createElement('script');

    if (scriptAntigo.src) {
      // Necessario para telas SPA que dependem de bibliotecas externas (ex.: QRCode CDN).
      await new Promise((resolve) => {
        scriptNovo.src = scriptAntigo.src;
        scriptNovo.async = false;
        scriptNovo.onload = resolve;
        scriptNovo.onerror = resolve;
        scriptAntigo.parentNode.replaceChild(scriptNovo, scriptAntigo);
      });
      continue;
    }

    scriptNovo.textContent = scriptAntigo.textContent;
    scriptAntigo.parentNode.replaceChild(scriptNovo, scriptAntigo);
  }
}

/**
 * Atualiza item ativo no menu de navegação
 */
function atualizarNavegacaoAtiva(rota) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === `#${rota}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Mostra página 404
 */
function mostrarPagina404() {
  appContainer.innerHTML = `
    <div style="text-align: center; padding: 4rem 1rem;">
      <h1 style="font-size: 6rem; margin: 0; color: var(--cor-primaria);">404</h1>
      <h2 style="color: var(--cor-texto);">Página não encontrada</h2>
      <p style="color: var(--cor-texto-secundario); margin-bottom: 2rem;">
        A página que você está procurando não existe.
      </p>
      <a href="#/dashboard" class="btn btn-primary">Voltar ao Dashboard</a>
    </div>
  `;
}

/**
 * Listener de mudança de hash (navegação)
 */
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1); // Remove o #
  carregarPagina(hash || '/');
});

/**
 * Inicialização da aplicação
 */
function inicializarApp() {
  console.log('🚀 Iniciando aplicação...');
  
  // Carregar página inicial baseada no hash
  const hashInicial = window.location.hash.slice(1) || '/';
  carregarPagina(hashInicial);
  
  // Exibir informações do usuário (se autenticado)
  if (estaAutenticado()) {
    exibirInfoUsuario();
  }
  
  console.log('✅ Aplicação iniciada!');
}

/**
 * Aguardar DOM carregar completamente
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
  inicializarApp();
}

/**
 * Navegação programática
 * Uso: navegar('/dashboard')
 */
function navegar(rota) {
  window.location.hash = `#${rota}`;
}

/**
 * Recarregar página atual
 */
function recarregarPagina() {
  const rotaAtual = window.location.hash.slice(1) || '/';
  carregarPagina(rotaAtual);
}
