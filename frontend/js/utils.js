/**
 * 🛠️ UTILIDADES
 * 
 * Funções auxiliares reutilizáveis em todo o sistema.
 * Validações, formatações, máscaras, helpers, etc.
 */

/**
 * ==========================================
 * VALIDAÇÕES (formato apenas - backend valida de verdade)
 * ==========================================
 */

/**
 * Valida formato de CPF (11 dígitos)
 * Aceita: 12345678900 ou 123.456.789-00
 * NÃO valida dígitos verificadores (backend faz isso)
 */
function validarFormatoCPF(cpf) {
  if (!cpf) return false;
  cpf = cpf.replace(/\D/g, ''); // Remove não-dígitos
  return cpf.length === 11;
}

/**
 * Valida formato de email
 */
function validarEmail(email) {
  if (!email) return false;
  return CONFIG.VALIDATION.emailRegex.test(email);
}

/**
 * Valida se campo está vazio
 */
function campoVazio(valor) {
  return !valor || valor.trim() === '';
}


/**
 * ==========================================
 * FORMATAÇÃO
 * ==========================================
 */

/**
 * Formata CPF: 12345678900 → 123.456.789-00
 */
function formatarCPF(cpf) {
  if (!cpf) return '';
  cpf = cpf.replace(/\D/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove formatação de CPF: 123.456.789-00 → 12345678900
 */
function limparCPF(cpf) {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

/**
 * Formata telefone: 11987654321 → (11) 98765-4321
 */
function formatarTelefone(telefone) {
  if (!telefone) return '';
  telefone = telefone.replace(/\D/g, '');
  
  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
}

/**
 * Formata data: 2026-04-17 → 17/04/2026
 */
function formatarData(data) {
  if (!data) return '';
  
  const d = new Date(data);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata data e hora: 2026-04-17T14:30:00 → 17/04/2026 14:30
 */
function formatarDataHora(dataHora) {
  if (!dataHora) return '';
  
  const d = new Date(dataHora);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');
  
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}


/**
 * ==========================================
 * MÁSCARAS DE INPUT
 * ==========================================
 */

/**
 * Aplica máscara de CPF em input
 * Uso: <input onkeyup="mascaraCPF(this)">
 */
function mascaraCPF(input) {
  let valor = input.value.replace(/\D/g, '');
  valor = valor.substring(0, 11); // Máximo 11 dígitos
  
  if (valor.length >= 9) {
    valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  } else if (valor.length >= 6) {
    valor = valor.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  } else if (valor.length >= 3) {
    valor = valor.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  }
  
  input.value = valor;
}

/**
 * Aplica máscara de telefone em input
 */
function mascaraTelefone(input) {
  let valor = input.value.replace(/\D/g, '');
  valor = valor.substring(0, 11); // Máximo 11 dígitos
  
  if (valor.length >= 7) {
    if (valor.length === 11) {
      valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else {
      valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
  } else if (valor.length >= 2) {
    valor = valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  }
  
  input.value = valor;
}


/**
 * ==========================================
 * FEEDBACK VISUAL
 * ==========================================
 */

/**
 * Mostra loading overlay
 */
function mostrarLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
  } else {
    const div = document.createElement('div');
    div.id = 'loading-overlay';
    div.className = 'loading-overlay';
    div.innerHTML = '<div class="loading"></div>';
    document.body.appendChild(div);
  }
}

/**
 * Esconde loading overlay
 */
function esconderLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * Mostra mensagem (toast/alert)
 * Tipos: success, error, warning, info
 */
function mostrarMensagem(tipo, mensagem, duracao = 5000) {
  const container = document.getElementById('toast-container') || criarToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `alert alert-${tipo === 'error' ? 'error' : tipo} toast-message`;
  toast.textContent = mensagem;
  toast.style.animation = 'slideInRight 0.3s ease-out';
  
  container.appendChild(toast);
  
  // Remover após duração
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, duracao);
}

function criarToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  document.body.appendChild(container);
  return container;
}


/**
 * ==========================================
 * STORAGE (LocalStorage)
 * ==========================================
 */

/**
 * Salva dado no localStorage
 */
function salvarStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
    return false;
  }
}

/**
 * Busca dado do localStorage
 */
function buscarStorage(chave) {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : null;
  } catch (e) {
    console.error('Erro ao buscar do localStorage:', e);
    return null;
  }
}

/**
 * Remove dado do localStorage
 */
function removerStorage(chave) {
  try {
    localStorage.removeItem(chave);
    return true;
  } catch (e) {
    console.error('Erro ao remover do localStorage:', e);
    return false;
  }
}


/**
 * ==========================================
 * HELPERS
 * ==========================================
 */

/**
 * Verifica se é sábado
 */
function ehSabado(data = new Date()) {
  return data.getDay() === 6;
}

/**
 * Debounce - atrasa execução de função
 * Útil para busca em tempo real
 */
function debounce(func, delay = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Copia texto para clipboard
 */
async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    mostrarMensagem('success', 'Copiado para a área de transferência!');
    return true;
  } catch (e) {
    console.error('Erro ao copiar:', e);
    mostrarMensagem('error', 'Não foi possível copiar.');
    return false;
  }
}

/**
 * Download de arquivo
 */
function downloadArquivo(url, nomeArquivo) {
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


/**
 * ==========================================
 * ANIMAÇÕES CSS
 * ==========================================
 */

// Adicionar animações ao head
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .toast-message {
    min-width: 250px;
    max-width: 400px;
  }
`;
document.head.appendChild(style);
