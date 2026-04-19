# 🎨 Frontend - Sistema de Presença com QR Code

## 📋 Resumo

Frontend separado do backend, hospedado independentemente (Vercel, Netlify, etc). Interface responsiva com Bootstrap 5, modo claro/escuro, e fácil manutenção para iniciantes.

**Identidade Visual**: Azul Royal (#0052CC) + Amarelo Mostarda (#F6C244) + Branco  
**Arquitetura**: SPA (Single Page Application) com HTML/CSS/JavaScript vanilla  
**Comunicação**: API REST com backend Node.js via fetch/AJAX  
**Deploy**: Frontend e backend em servidores diferentes  

---

## 🎯 Separação de Responsabilidades

### **Frontend (Camada de Apresentação)**

**✅ O que o frontend FAZ:**
- Validações de UX básicas (formato CPF, email tem @, campos vazios)
- Máscaras de input (CPF: 000.000.000-00, telefone)
- Feedback visual (loading, mensagens de sucesso/erro)
- Navegação entre páginas (routing)
- Abrir/fechar modals, menus
- Atualização automática da tela (polling)

**❌ O que o frontend NÃO FAZ:**
- Validar se CPF é válido (algoritmo dos dígitos verificadores)
- Verificar se aluno existe no banco de dados
- Decidir se pode ou não registrar presença
- Calcular estatísticas ou reconhecimento facial
- Autorizar ações (permissões de usuário)
- **NENHUMA regra de negócio**
- **NENHUMA validação de segurança**

### **Backend (Lógica de Negócio)**

**✅ Tudo que é importante fica no backend:**
- Validações críticas (CPF válido, email único, aluno existe)
- Regras de negócio (pode registrar presença? evento ativo? duplicado?)
- Autenticação JWT e permissões de acesso
- Reconhecimento facial e cálculos de confiança
- Persistência e integridade de dados
- Segurança completa

### 📝 Exemplo Prático: Registro de Presença

**Frontend:**
```
1. Verifica se CPF tem 11 números → erro "CPF precisa ter 11 dígitos"
2. Verifica se email tem @ → erro "Email inválido"  
3. Mostra loading...
4. Envia: POST /api/registrar-presenca { cpf, email }
5. Recebe resposta → Mostra "Presença registrada!" ✓
```

**Backend:**
```
1. Valida CPF com algoritmo (dígitos verificadores) ✓
2. Busca aluno no banco pelo CPF ✓
3. Verifica se email corresponde ao cadastrado ✓
4. Verifica se evento está ativo hoje ✓
5. Verifica se já registrou presença (sem duplicação) ✓
6. Verifica se precisa reconhecimento facial ✓
7. Se tudo OK → Salva no banco e retorna sucesso
```

**Importante**: Mesmo que alguém desabilite o JavaScript, o backend sempre valida tudo novamente.

---

## 📂 Estrutura de Arquivos

```
frontend/
│
├── index.html                    # 🏠 Ponto de entrada da SPA
├── config.js                     # 🔧 URLs da API, configurações globais
│
├── css/
│   ├── variables.css             # 🎨 CORES E TEMAS (modificar aqui!)
│   ├── global.css                # Reset CSS, tipografia, layout base
│   ├── components.css            # Botões, cards, forms customizados
│   └── print.css                 # Estilos para impressão (@media print)
│
├── js/
│   ├── app.js                    # Router, inicialização da aplicação
│   ├── auth.js                   # Login, logout, verificação de token
│   ├── api.js                    # 📡 TODAS as chamadas fetch() centralizadas
│   ├── theme.js                  # Modo claro/escuro (toggle)
│   ├── utils.js                  # Validação CPF, formatação, helpers
│   └── polling.js                # Sistema de atualização automática (10s)
│
├── pages/
│   ├── login.html                # Tela de login admin
│   ├── dashboard.html            # Painel principal (lista de presença)
│   ├── alunos.html               # CRUD de alunos
│   ├── eventos.html              # CRUD de eventos (criar, gerar QR)
│   ├── presenca.html             # Registro de presença (público)
│   └── estatisticas.html         # Gráficos e relatórios
│
└── assets/
    ├── icons/                    # Ícones SVG (sol, lua, check, x)
    └── sounds/                   # Sons de notificação (opcional)
```

---

## 🎨 Arquivos-Chave para Manutenção

### 1. **`css/variables.css`** ⭐ MAIS IMPORTANTE

**Mudar TODAS as cores do sistema aqui!**

**Identidade Visual**: Azul + Amarelo + Branco

```css
/* Modo Claro - Identidade Visual Empresa */
:root[data-theme="light"] {
  /* Cores Principais (Identidade Visual) */
  --cor-primaria: #0052CC;        /* Azul Royal (principal) */
  --cor-secundaria: #F6C244;      /* Amarelo Mostarda (destaque) */
  --cor-terciaria: #FFFFFF;       /* Branco */
  
  /* Cores de Status */
  --cor-sucesso: #28a745;         /* Verde (presente ✓) */
  --cor-erro: #dc3545;            /* Vermelho (ausente ✗) */
  --cor-aviso: #ffc107;           /* Amarelo (pendente) */
  --cor-info: #17a2b8;            /* Azul claro (info) */
  
  /* Fundos e Textos */
  --cor-fundo: #FFFFFF;           /* Fundo branco */
  --cor-fundo-secundario: #F8F9FA;/* Cinza clarísimo */
  --cor-texto: #212529;           /* Texto preto */
  --cor-texto-secundario: #6c757d;/* Texto cinza */
  
  /* Componentes */
  --cor-borda: #dee2e6;           /* Bordas sutis */
  --cor-hover: #003D99;           /* Azul mais escuro (hover) */
  --sombra: rgba(0, 82, 204, 0.15); /* Sombra azul suave */
}

/* Modo Escuro - Mantém Identidade Visual */
:root[data-theme="dark"] {
  /* Cores Principais (ajustadas para dark) */
  --cor-primaria: #4A90E2;        /* Azul mais claro para contraste */
  --cor-secundaria: #FFD966;      /* Amarelo mais claro */
  --cor-terciaria: #1E1E1E;       /* Preto suave */
  
  /* Cores de Status */
  --cor-sucesso: #34D058;         /* Verde mais vibrante */
  --cor-erro: #F97583;            /* Vermelho mais suave */
  --cor-aviso: #FFD700;           /* Amarelo ouro */
  --cor-info: #58A6FF;            /* Azul claro */
  
  /* Fundos e Textos */
  --cor-fundo: #1E1E1E;           /* Fundo escuro */
  --cor-fundo-secundario: #2D2D2D;/* Cinza escuro */
  --cor-texto: #F8F9FA;           /* Texto claro */
  --cor-texto-secundario: #ADB5BD;/* Texto cinza claro */
  
  /* Componentes */
  --cor-borda: #444444;           /* Bordas escuras */
  --cor-hover: #6BACFF;           /* Azul mais claro (hover) */
  --sombra: rgba(74, 144, 226, 0.2); /* Sombra azul escura */
}
```

**Como usar em qualquer CSS:**
```css
/* Botão principal (azul) */
.btn-primary {
  background-color: var(--cor-primaria);  /* Azul */
  color: var(--cor-terciaria);            /* Branco */
}

/* Botão de destaque (amarelo) */
.btn-destaque {
  background-color: var(--cor-secundaria); /* Amarelo */
  color: var(--cor-texto);                 /* Preto */
}

/* Card com status presente */
.card-presente {
  border-left: 4px solid var(--cor-sucesso); /* Verde */
  background: var(--cor-fundo);
}

/* Card com status ausente */
.card-ausente {
  border-left: 4px solid var(--cor-erro); /* Vermelho */
  background: var(--cor-fundo);
}
```

**Exemplos de Combinações da Identidade Visual:**
- **Cabeçalho**: Fundo azul (`--cor-primaria`) + texto branco (`--cor-terciaria`)
- **Botões principais**: Fundo azul com hover amarelo
- **Destaques**: Amarelo (`--cor-secundaria`) para badges, ícones importantes
- **Fundos**: Branco alternando com cinza clarísimo (`--cor-fundo-secundario`)

### 2. **`config.js`** ⭐ Configurações Globais

```javascript
const CONFIG = {
  // URL do backend (mudar conforme ambiente)
  API_URL: 'http://localhost:5000/api',  // Desenvolvimento
  // API_URL: 'https://api-producao.com/api',  // Produção
  
  // Configurações de polling
  POLLING_INTERVAL: 10000,  // 10 segundos
  
  // Timeout de requisições
  REQUEST_TIMEOUT: 30000,   // 30 segundos
  
  // Persistência
  STORAGE_KEYS: {
    token: 'auth_token',
    user: 'auth_user',
    theme: 'app_theme'
  }
};
```

### 3. **`js/api.js`** ⭐ Todas as Chamadas ao Backend

```javascript
// Exemplo de estrutura
const API = {
  // Autenticação
  login: (email, senha) => fetch(`${CONFIG.API_URL}/login`, { ... }),
  logout: () => fetch(`${CONFIG.API_URL}/logout`, { ... }),
  
  // Alunos
  listarAlunos: () => fetch(`${CONFIG.API_URL}/alunos`, { ... }),
  criarAluno: (dados) => fetch(`${CONFIG.API_URL}/alunos`, { method: 'POST', ... }),
  
  // Presença
  registrarPresenca: (dados) => fetch(`${CONFIG.API_URL}/registrar-presenca`, { ... }),
  listarPresencas: () => fetch(`${CONFIG.API_URL}/lista-presenca`, { ... }),
  
  // Eventos
  criarEvento: (dados) => fetch(`${CONFIG.API_URL}/eventos`, { ... }),
  eventoAtual: () => fetch(`${CONFIG.API_URL}/evento-atual`, { ... })
};
```

### 4. **`js/utils.js`** ⭐ Funções Auxiliares

```javascript
// Validação de CPF (apenas formato - backend valida de verdade)
function validarFormatoCPF(cpf) {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf) || /^\d{11}$/.test(cpf);
}

// Máscara de CPF
function formatarCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Mostrar loading
function mostrarLoading() { ... }

// Mostrar mensagem de sucesso/erro
function mostrarMensagem(tipo, texto) { ... }
```

---

## 🛠️ Tecnologias Utilizadas

### Core
- **HTML5** — Estrutura semântica
- **CSS3** — Estilização com variáveis CSS (custom properties)
- **JavaScript Vanilla** — Sem frameworks pesados (React, Vue)

### Bibliotecas
- **Bootstrap 5.3** — Componentes prontos (navbar, cards, modals, forms, grid)
- **Chart.js 4.x** — Gráficos leves (pizza, linha) para estatísticas
- **Font Awesome** — Ícones (opcional, pode usar Bootstrap Icons)

### Recursos do Browser
- **Fetch API** — Requisições HTTP para o backend
- **localStorage** — Persistir tema e token de autenticação
- **Media Devices API** — Câmera para selfie no registro de presença
- **Hash Routing** — Navegação SPA (index.html#/dashboard)

---

## 📱 Páginas Principais

### 1. **Login Admin** (`pages/login.html`)
- Formulário email + senha
- Validação básica (campos vazios)
- Envia credenciais para `POST /api/login`
- Salva token JWT no localStorage
- Redireciona para dashboard

### 2. **Dashboard Admin** (`pages/dashboard.html`) ⭐
- **Lista de alunos** com status visual:
  - ✅ Verde = Presente (registrou presença)
  - ❌ Vermelho = Ausente
- **Atualização automática** a cada 10 segundos (polling)
- **Busca em tempo real** (filtrar por nome)
- **Contador**: X presentes de Y total (X%)
- **Botão** "Imprimir Lista"

### 3. **Gestão de Alunos** (`pages/alunos.html`)
- **Tela administrativa** para cadastrar e gerenciar alunos
- Tabela com lista completa de alunos cadastrados
- Botões: Adicionar, Editar, Remover
- Modal Bootstrap para formulários (pop-up)
- **Campos do cadastro**:
  - Nome completo (obrigatório)
  - CPF (obrigatório, único no sistema)
  - Matrícula (obrigatório)
  - Email (obrigatório, formato válido)
  - Telefone (opcional, com máscara)
  - Foto de cadastro (obrigatória - para reconhecimento facial)
- Upload de foto (base64 ou FormData)
- **Validações frontend**: 
  - CPF tem 11 dígitos
  - Email tem @
  - Campos obrigatórios preenchidos
- **Validações backend** (reais):
  - CPF válido com algoritmo
  - CPF único (não pode duplicar)
  - Email único
  - Foto enviada corretamente

### 4. **Gestão de Eventos** (`pages/eventos.html`)
- Lista de eventos (data, status ativo/inativo)
- Criar novo evento (seletor de data - só sábados)
- Gerar QR Code antecipadamente
- Preview do QR Code
- Botão download QR Code (PNG)
- Toggle "Requer Reconhecimento Facial"

### 5. **Registro de Presença - PÚBLICO** (`pages/presenca.html`) ⭐
- **Acesso via QR Code**: `/presenca?token=ABC123`
- Formulário simplificado:
  - CPF (com máscara: 000.000.000-00)
  - Email
- **Câmera para selfie** (só se evento exigir reconhecimento facial)
- Validações de formato
- Feedback visual:
  - Loading (enviando...)
  - Sucesso ✓ "Presença registrada com sucesso!"
  - Erro ✗ "CPF ou email inválidos"

### 6. **Estatísticas** (`pages/estatisticas.html`)
- **Gráfico de Pizza** (Chart.js): Presentes vs Ausentes
- **Gráfico de Linha**: Presença ao longo dos sábados
- **Cards com números-chave**:
  - Total de alunos
  - Presentes hoje
  - Ausentes hoje
  - % de presença
- Filtros por período (semana, mês, ano)

---

## 🌓 Modo Claro / Escuro

### Como Funciona

1. **Toggle Button** — Botão com ícone de sol/lua
2. **localStorage** — Salva preferência do usuário
3. **Atributo data-theme** — Aplica no `<html data-theme="dark">`
4. **CSS Variables** — Cores mudam automaticamente

### Implementação Simples

**HTML:**
```html
<button id="theme-toggle">
  <i class="fa fa-moon"></i> <!-- Alterna para sol -->
</button>
```

**JavaScript (theme.js):**
```javascript
const toggleButton = document.getElementById('theme-toggle');
const html = document.documentElement;

// Carregar tema salvo
const savedTheme = localStorage.getItem('app_theme') || 'light';
html.setAttribute('data-theme', savedTheme);

// Alternar tema
toggleButton.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('app_theme', newTheme);
  
  // Mudar ícone
  toggleButton.innerHTML = newTheme === 'light' 
    ? '<i class="fa fa-moon"></i>' 
    : '<i class="fa fa-sun"></i>';
});
```

**CSS (variables.css):**
```css
/* Modo Claro (padrão) */
:root[data-theme="light"] {
  --cor-fundo: #ffffff;
  --cor-texto: #212529;
}

/* Modo Escuro */
:root[data-theme="dark"] {
  --cor-fundo: #212529;
  --cor-texto: #f8f9fa;
}

/* Usar em qualquer lugar */
body {
  background-color: var(--cor-fundo);
  color: var(--cor-texto);
  transition: background-color 0.3s, color 0.3s;
}
```

---

## 🔄 Atualização Automática (Polling)

Dashboard atualiza lista de presença a cada 10 segundos sem recarregar a página.

**Implementação (polling.js):**
```javascript
let pollingInterval = null;

function iniciarPolling(callback, intervalo = 10000) {
  // Executar imediatamente
  callback();
  
  // Repetir a cada 10s
  pollingInterval = setInterval(callback, intervalo);
  
  // Pausar quando usuário sai da aba (economiza recursos)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pararPolling();
    } else {
      iniciarPolling(callback, intervalo);
    }
  });
}

function pararPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// Uso no dashboard
iniciarPolling(async () => {
  const presencas = await API.listarPresencas();
  atualizarListaVisual(presencas);
});
```

---

## 🖨️ Impressão de Relatórios

**Botão no dashboard:**
```html
<button onclick="window.print()">Imprimir Lista</button>
```

**CSS específico para impressão (print.css):**
```css
@media print {
  /* Esconder elementos desnecessários */
  .navbar, .sidebar, button, .no-print {
    display: none !important;
  }
  
  /* Remover cores de fundo (economizar tinta) */
  body {
    background: white;
    color: black;
  }
  
  /* Lista limpa */
  .lista-presenca {
    font-size: 12pt;
  }
  
  /* Quebrar página entre seções */
  .page-break {
    page-break-after: always;
  }
}
```

---

## ✅ Funcionalidades Incluídas

### Autenticação e Segurança
- ✅ Login admin com JWT
- ✅ Token armazenado no localStorage
- ✅ Proteção de rotas (redireciona se não autenticado)
- ✅ Logout (limpa token)

### Interface Admin
- ✅ Dashboard com lista de presença em tempo real
- ✅ **CRUD completo de alunos (admin cadastra com foto para reconhecimento facial)**
- ✅ CRUD completo de eventos
- ✅ Gerar e baixar QR Codes
- ✅ Modo claro/escuro persistente
- ✅ Responsivo (mobile-friendly)

### Interface Pública
- ✅ Página de registro de presença (via QR Code)
- ✅ Formulário simples: CPF + Email
- ✅ Câmera para selfie (se evento exigir reconhecimento facial)
- ✅ Feedback visual de sucesso/erro

### UX/UI
- ✅ Loading states (spinners)
- ✅ Mensagens de sucesso/erro (toasts/alerts)
- ✅ Validações visuais em tempo real
- ✅ Máscaras de input (CPF, telefone)
- ✅ Busca/filtro instantâneo

### Extras
- ✅ Atualização automática (polling 10s)
- ✅ Gráficos e estatísticas (Chart.js)
- ✅ Impressão de relatórios
- ✅ Câmera para selfie (MediaDevices API)

---

## ❌ Funcionalidades Excluídas (pode adicionar depois)

- ❌ WebSockets (usar polling no início — mais simples)
- ❌ PWA (Progressive Web App)
- ❌ Notificações push do navegador
- ❌ Internacionalização (i18n) — apenas português
- ❌ Testes automatizados (Jest, Cypress)
- ❌ Bundler/transpiler (Webpack, Vite) — arquivos diretos

---

## 🚀 Como Desenvolver

### 1. Servir Localmente

**Opção A - Live Server (VS Code):**
```
1. Instalar extensão "Live Server"
2. Clicar com botão direito em index.html
3. Selecionar "Open with Live Server"
4. Abre em http://localhost:5500
```

**Opção B - npx serve:**
```bash
cd frontend
npx serve -p 3000
```

**Opção C - Python:**
```bash
cd frontend
python -m http.server 3000
```

### 2. Conectar ao Backend

Editar `config.js`:
```javascript
const CONFIG = {
  API_URL: 'http://localhost:5000/api',  // URL do backend
};
```

### 3. Testar CORS

Backend precisa aceitar requisições do frontend:
```javascript
// backend: server.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000'  // URL do frontend
}));
```

---

## 🧪 Testes Manuais

### Checklist Essencial:

- [ ] **Login**: Credenciais válidas/inválidas, logout funciona
- [ ] **Dashboard**: Lista carrega, status verde/vermelho corretos
- [ ] **Atualização**: Lista atualiza automaticamente a cada 10s
- [ ] **Busca**: Filtrar alunos por nome funciona instantaneamente
- [ ] **Modo Escuro**: Toggle alterna cores, persiste após reload
- [ ] **Registro Presença**: CPF + email funcionam, validações OK
- [ ] **Câmera**: Selfie abre no mobile e desktop (se reconhecimento ativo)
- [ ] **Alunos CRUD**: Adicionar, editar, remover funcionam
- [ ] **Eventos CRUD**: Criar evento, gerar QR Code, download PNG
- [ ] **Impressão**: Imprimir lista mostra layout limpo
- [ ] **Gráficos**: Chart.js renderiza corretamente
- [ ] **Mobile**: Funciona em celular, menu responsivo

---

## 🎓 Para Iniciantes: Como Fazer Mudanças

### Mudar Cores do Sistema Inteiro
1. Abrir `frontend/css/variables.css`
2. Editar valores das variáveis:
```css
:root[data-theme="light"] {
  --cor-primaria: #0052CC;     /* Azul Royal da empresa */
  --cor-secundaria: #F6C244;   /* Amarelo Mostarda da empresa */
  
  /* Mudar para tons diferentes se quiser: */
  /* --cor-primaria: #003366;  (Azul mais escuro) */
  /* --cor-secundaria: #FFD700; (Amarelo ouro) */
}
```
3. Salvar e recarregar página → **Todas as cores mudam automaticamente!**

**Dica**: Use sites como [Coolors.co](https://coolors.co) para encontrar tons de azul e amarelo que combinem bem.

---

## 🎨 Identidade Visual

### Paleta de Cores Principal

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🔵 AZUL ROYAL (#0052CC)                           │
│  ├─ Navbar, cabeçalhos, botões principais          │
│  ├─ Links e elementos interativos                  │
│  └─ Representa: Confiança, profissionalismo        │
│                                                     │
│  🟡 AMARELO MOSTARDA (#F6C244)                     │
│  ├─ Destaques, badges, notificações                │
│  ├─ Botões secundários, alertas importantes        │
│  └─ Representa: Energia, atenção                   │
│                                                     │
│  ⚪ BRANCO (#FFFFFF)                               │
│  ├─ Fundos principais, textos em fundo escuro      │
│  ├─ Cards, modais                                   │
│  └─ Representa: Clareza, simplicidade              │
│                                                     │
│  🟢 VERDE (#28a745) - Status Presente              │
│  🔴 VERMELHO (#dc3545) - Status Ausente            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Exemplos de Uso:

**Modo Claro:**
- Navbar: Fundo azul (#0052CC) + texto branco
- Botão Primário: Fundo azul + texto branco + hover azul escuro
- Botão Destaque: Fundo amarelo + texto preto + hover amarelo escuro
- Cards: Fundo branco + borda azul suave
- Badge "Novo": Fundo amarelo + texto preto

**Modo Escuro:**
- Navbar: Fundo preto suave (#1E1E1E) + texto azul claro (#4A90E2)
- Botão Primário: Fundo azul claro (#4A90E2) + texto preto
- Cards: Fundo cinza escuro (#2D2D2D) + borda azul
- Acentos: Amarelo mais vibrante para contrastar com fundo escuro

### Adicionar Nova Página
1. Criar `frontend/pages/minha-pagina.html`
2. Adicionar rota em `frontend/js/app.js`:
```javascript
const routes = {
  '/minha-pagina': 'pages/minha-pagina.html'
};
```
3. Adicionar link no menu:
```html
<a href="#/minha-pagina">Minha Página</a>
```

### Adicionar Nova Chamada API
1. Abrir `frontend/js/api.js`
2. Adicionar função:
```javascript
const API = {
  minhaFuncao: async () => {
    const response = await fetch(`${CONFIG.API_URL}/meu-endpoint`);
    return response.json();
  }
};
```
3. Usar em qualquer página:
```javascript
const dados = await API.minhaFuncao();
```

### Adicionar Validação de Campo
1. Abrir `frontend/js/utils.js`
2. Criar função:
```javascript
function validarTelefone(tel) {
  return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(tel);
}
```
3. Usar no formulário:
```javascript
if (!validarTelefone(telefone)) {
  mostrarMensagem('erro', 'Telefone inválido');
}
```

---

## 📦 Deploy em Produção

### Opções de Hospedagem (Frontend):

**Vercel (Recomendado):**
```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Fazer deploy
cd frontend
vercel --prod
```

**Netlify:**
```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Fazer deploy
cd frontend
netlify deploy --prod
```

**GitHub Pages:**
```bash
# 1. Push para repositório
git add frontend/
git commit -m "Deploy frontend"
git push

# 2. Configurar GitHub Pages:
# Settings > Pages > Source: main branch > /frontend folder
```

### Configurar URL de Produção

Editar `frontend/config.js`:
```javascript
const CONFIG = {
  API_URL: 'https://seu-backend.herokuapp.com/api',  // URL real
};
```

---

## 📚 Recursos Úteis

### Documentação:
- **Bootstrap 5**: https://getbootstrap.com/docs/5.3/
- **Chart.js**: https://www.chartjs.org/docs/
- **MDN (JavaScript)**: https://developer.mozilla.org/pt-BR/

### Tutoriais:
- CSS Variables: https://developer.mozilla.org/pt-BR/docs/Web/CSS/Using_CSS_custom_properties
- Fetch API: https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API
- localStorage: https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage

---

## � Resumo da Identidade Visual

### Paleta Oficial Aprovada

| Cor | Hex | Uso Principal |
|-----|-----|---------------|
| 🔵 **Azul Royal** | `#0052CC` | Navbar, botões principais, links, cabeçalhos |
| 🟡 **Amarelo Mostarda** | `#F6C244` | Destaques, badges, botões secundários, alertas |
| ⚪ **Branco** | `#FFFFFF` | Fundos, cards, texto em fundo escuro |
| 🟢 **Verde** | `#28a745` | Status "Presente" ✓ |
| 🔴 **Vermelho** | `#dc3545` | Status "Ausente" ✗ |

### Aplicação Consistente

**Elementos principais com identidade visual:**
- ✅ Navbar/Header → Fundo azul + logo
- ✅ Botões primários → Azul com hover mais escuro
- ✅ Botões de destaque → Amarelo com ícones
- ✅ Links → Azul que muda para amarelo no hover
- ✅ Badges/Pills → Amarelo para notificações
- ✅ Cards → Bordas azuis sutis
- ✅ Dashboard → Cards de presença com bordas coloridas (verde/vermelho)
- ✅ Loading spinner → Azul
- ✅ Ícones de ação → Azul com hover amarelo

**Contraste e Acessibilidade:**
- Azul (#0052CC) sobre branco = ✅ Contraste alto (legível)
- Amarelo (#F6C244) sobre branco com borda = ✅ Visível
- Branco sobre azul = ✅ Ótimo contraste
- Preto sobre amarelo = ✅ Legível

### Onde EVITAR combinações:
- ❌ Amarelo sobre branco sem borda (pouco contraste)
- ❌ Azul claro sobre amarelo (péssima legibilidade)
- ✅ Use sempre: azul + branco, amarelo + preto/cinza escuro

---

## �🎯 Próximos Passos

1. ✅ **Confirmar paleta de cores** (Azul #0052CC + Amarelo #F6C244 aprovados!)
2. ⬜ Criar estrutura de pastas e arquivos base
3. ⬜ Implementar sistema de cores e modo escuro com identidade visual
4. ⬜ Criar página de login
5. ⬜ Implementar dashboard com polling
6. ⬜ Criar CRUD de alunos (admin cadastra com foto)
7. ⬜ Criar CRUD de eventos
8. ⬜ Implementar página de registro de presença
9. ⬜ Adicionar gráficos e estatísticas
10. ⬜ Deploy frontend (Vercel/Netlify)
11. ⬜ Testes finais e ajustes

---

**Criado em**: 17 de Abril de 2026  
**Versão**: 1.0  
**Stack**: HTML5 + CSS3 + JavaScript Vanilla + Bootstrap 5 + Chart.js

teste