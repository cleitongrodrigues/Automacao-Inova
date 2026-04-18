/**
 * 🔒 AUTENTICAÇÃO
 * 
 * Sistema de login, logout e verificação de autenticação.
 * Gerencia token JWT e dados do usuário.
 */

/**
 * Faz login do usuário
 * @param {string} email 
 * @param {string} senha 
 * @returns {Promise<Object>} Dados do usuário e token
 */
async function login(email, senha) {
  try {
    mostrarLoading();

    const data = await API.login(email, senha);
    const ok = !!(data && (data.success || data.sucesso));

    if (ok) {
      // Salvar token e dados do usuário
      salvarStorage(CONFIG.STORAGE_KEYS.token, data.token);
      salvarStorage(CONFIG.STORAGE_KEYS.user, data.user);
      
      mostrarMensagem('success', `Bem-vindo(a), ${data.user.nome}!`);
      
      return { success: true, user: data.user };
    } else {
      throw new Error(data?.mensagem || data?.message || 'Credenciais inválidas');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    mostrarMensagem('error', error.message || 'Erro ao fazer login');
    return { success: false, error: error.message };
  } finally {
    esconderLoading();
  }
}

/**
 * Faz logout do usuário
 */
function logout() {
  // Remover token e dados do usuário
  removerStorage(CONFIG.STORAGE_KEYS.token);
  removerStorage(CONFIG.STORAGE_KEYS.user);
  
  mostrarMensagem('info', 'Logout realizado com sucesso');
  
  // Redirecionar para login
  setTimeout(() => {
    window.location.hash = '#/login';
  }, 1000);
}

/**
 * Verifica se usuário está autenticado
 * @returns {boolean}
 */
function estaAutenticado() {
  const token = buscarStorage(CONFIG.STORAGE_KEYS.token);
  return !!token;
}

/**
 * Retorna token JWT
 * @returns {string|null}
 */
function obterToken() {
  return buscarStorage(CONFIG.STORAGE_KEYS.token);
}

/**
 * Retorna dados do usuário logado
 * @returns {Object|null}
 */
function obterUsuario() {
  return buscarStorage(CONFIG.STORAGE_KEYS.user);
}

/**
 * Protege rota - redireciona para login se não autenticado
 * Usar no início das páginas admin
 */
function protegerRota() {
  if (!estaAutenticado()) {
    mostrarMensagem('warning', CONFIG.MESSAGES.unauthorized);
    window.location.hash = '#/login';
    return false;
  }
  return true;
}

/**
 * Redireciona se já estiver autenticado
 * Usar na página de login
 */
function redirecionarSeAutenticado() {
  if (estaAutenticado()) {
    window.location.hash = '#/dashboard';
    return true;
  }
  return false;
}

/**
 * Adiciona token JWT nos headers das requisições
 * @returns {Object} Headers com Authorization
 */
function obterHeadersAutenticados() {
  const token = obterToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

/**
 * Verifica se token expirou (tratamento de erro 401)
 */
function verificarTokenExpirado(response) {
  if (response.status === 401) {
    mostrarMensagem('warning', 'Sessão expirada. Faça login novamente.');
    logout();
    return true;
  }
  return false;
}

/**
 * Exibe informações do usuário na navbar (se houver)
 */
function exibirInfoUsuario() {
  const usuario = obterUsuario();
  const userInfo = document.getElementById('user-info');
  
  if (usuario && userInfo) {
    userInfo.innerHTML = `
      <span class="user-name">${usuario.nome}</span>
      <button onclick="logout()" class="btn btn-sm btn-outline" style="margin-left: 1rem;">
        Sair
      </button>
    `;
  }
}

// Auto-executar ao carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (estaAutenticado()) {
      exibirInfoUsuario();
    }
  });
} else {
  if (estaAutenticado()) {
    exibirInfoUsuario();
  }
}
