# 📋 Plano: Sistema de Presença Automatizado com QR Code

## 🎯 Resumo Executivo

Criar um sistema web de controle de presença para eventos aos sábados, substituindo assinatura manual por escaneamento de QR Code. Interface terá painel administrativo mostrando em tempo real quem confirmou presença (verde ✓) e quem não confirmou (vermelho), facilitando a distribuição de crachás.

**Stack Tecnológica**: Node.js + Express + SQLite (dev) → PostgreSQL (prod) + SQL Puro + EJS

---

## 🏗️ Arquitetura

### Backend
- **Node.js** com **Express** - API REST
- **SQLite** (desenvolvimento) → **PostgreSQL** (produção)
- **SQL Puro** - Queries otimizadas escritas manualmente (sem ORM)
- **better-sqlite3** - Driver SQLite síncrono e performático (dev)
- **pg** - Driver PostgreSQL (produção)
- **QRCode** - Geração de códigos QR

### Frontend
- **EJS** - Template engine
- **HTML/CSS/JavaScript** vanilla
- **Bootstrap/Tailwind** - Design responsivo
- **AJAX/Fetch API** - Atualização em tempo real

---

## 📦 Dependências (package.json)

```json
{
  "name": "automacao-inova-presenca",
  "version": "1.0.0",
  "description": "Sistema de controle de presença com QR Code",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node database/seeders.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "qrcode": "^1.5.3",
    "better-sqlite3": "^9.2.2",
    "express-session": "^1.17.3",
    "ejs": "^3.1.9",
    "bcrypt": "^5.1.1",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "face-api.js": "^0.22.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## 📂 Estrutura de Diretórios

```
Automacao-Inova/
│
├── server.js                      # Entry point da aplicação
├── package.json
├── .env                           # Variáveis de ambiente
├── .gitignore
├── README.md
├── PLANO.md                       # Este arquivo
│
├── src/
│   ├── config/
│   │   └── database.js            # Conexão SQLite/PostgreSQL
│   │
│   ├── db/                        # SQL e Queries
│   │   ├── schema.sql             # DDL - CREATE TABLE (estrutura)
│   │   ├── queries.js             # Todas as queries SQL organizadas
│   │   └── seed.js                # Script para popular dados de teste
│   │
│   ├── controllers/               # Lógica de negócio
│   │   ├── presencaController.js  # Controle de presenças
│   │   ├── alunoController.js     # CRUD de alunos
│   │   ├── eventoController.js    # Gerenciamento de eventos
│   │   └── authController.js      # Autenticação admin
│   │
│   ├── routes/                    # Definição de rotas
│   │   ├── api.js                 # Endpoints da API
│   │   ├── admin.js               # Rotas administrativas
│   │   └── qrcode.js              # Rotas de QR Code
│   │
│   ├── middleware/                # Middlewares customizados
│   │   ├── auth.js                # Autenticação
│   │   └── validation.js          # Validações
│   │
│   └── utils/                     # Funções auxiliares
│       ├── qrGenerator.js         # Geração de QR Code
│       ├── dateHelper.js          # Helpers de data (sábados)
│       └── faceRecognition.js     # Comparação facial
│
├── public/                        # Assets estáticos
│   ├── css/
│   │   └── style.css              # Estilos customizados
│   ├── js/
│   │   ├── painel.js              # Atualização do painel
│   │   └── camera.js              # Captura de selfie
│   └── img/
│       ├── qrcodes/               # QR Codes gerados
│       ├── fotos_cadastro/        # Fotos dos alunos
│       └── fotos_selfies/         # Selfies do momento
│       └── qrcodes/               # QR Codes gerados
│
├── views/                         # Templates EJS
│   ├── layout.ejs                 # Layout base
│   ├── index.ejs                  # Página inicial
│   ├── escanear.ejs               # Registro de presença
│   ├── painel.ejs                 # Dashboard ao vivo
│   ├── admin-login.ejs            # Login administrativo
│   ├── gerenciar-alunos.ejs       # CRUD de alunos
│   ├── gerenciar-admins.ejs       # CRUD de administradores
│   └── aprovacoes.ejs             # Aprovação manual de presenças
│
└── database/
    └── automacao.db               # SQLite database (gerado auto, apenas dev)
```

---

## 🗄️ Modelo de Dados

### Tabela: `alunos`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER PK | ID único do aluno |
| nome | VARCHAR(255) NOT NULL | Nome completo |
| cpf | VARCHAR(14) UNIQUE NOT NULL | CPF (obrigatório, validado) |
| matricula | VARCHAR(50) UNIQUE | Matrícula/código (opcional) |
| email | VARCHAR(255) NOT NULL | Email de contato (obrigatório) |
| telefone | VARCHAR(20) | Telefone (opcional) |
| **foto_cadastro** | **VARCHAR(255)** | **Path da foto para reconhecimento facial** |
| ativo | BOOLEAN DEFAULT 1 | Se está ativo no programa |
| created_at | TIMESTAMP | Data de cadastro |
| updated_at | TIMESTAMP | Última atualização |

**Nota**: Alunos devem ser **pré-cadastrados pelo admin** antes dos eventos. A **foto de cadastro** é usada para reconhecimento facial.

### Tabela: `admins` 🆕 **Nova**
| Campo | Tipo | Descrição |
|-------|------|-----------|  
| id | INTEGER PK | ID único do admin |
| nome | VARCHAR(255) NOT NULL | Nome completo |
| email | VARCHAR(255) UNIQUE NOT NULL | Email de login |
| senha_hash | VARCHAR(255) NOT NULL | Senha com bcrypt |
| nivel_acesso | VARCHAR(20) DEFAULT 'admin' | admin / super_admin |
| ativo | BOOLEAN DEFAULT 1 | Se está ativo |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

**Níveis de Acesso**:
- `admin`: Gerenciar alunos, eventos, aprovações, relatórios
- `super_admin`: Tudo + gerenciar outros admins

### Tabela: `eventos`
| Campo | Tipo | Descrição |
|-------|------|-----------|  
| id | INTEGER PK | ID único do evento |
| data | DATE UNIQUE | Data do sábado |
| qr_code_token | VARCHAR(255) UNIQUE | Token único do QR |
| qr_code_path | VARCHAR(255) | Caminho da imagem QR |
| **requer_reconhecimento_facial** | **BOOLEAN DEFAULT 1** | **Se exige selfie e comparação facial** |
| **descricao** | **VARCHAR(255)** | **Ex: "Evento Regular" ou "Evento Grande - 200+ alunos"** |
| ativo | BOOLEAN | Se o evento está ativo |
| created_at | TIMESTAMP | Data de criação |

**Configuração por Evento**:
- `requer_reconhecimento_facial = 1` (TRUE): Exige selfie + comparação facial
- `requer_reconhecimento_facial = 0` (FALSE): Apenas CPF + email (eventos grandes)

### Tabela: `presencas`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER PK | ID único da presença |
| aluno_id | INTEGER FK | Referência ao aluno |
| evento_id | INTEGER FK | Referência ao evento |
| data_hora_registro | TIMESTAMP | Momento do registro |
| **foto_selfie** | **VARCHAR(255)** | **Path da selfie tirada no momento** |
| **status** | **VARCHAR(20) DEFAULT 'pendente'** | **pendente / aprovada / rejeitada** |
| **confianca_facial** | **DECIMAL(5,2)** | **% de confiança do reconhecimento (0-100)** |
| **aprovado_por** | **INTEGER FK** | **Referência ao admin que aprovou (se manual)** |
| ip_address | VARCHAR(50) | IP do dispositivo |
| created_at | TIMESTAMP | Data de criação |

**Status**:
- `pendente`: Aguardando aprovação (facial falhou ou < 70% confiança)
- `aprovada`: Facial OK (>= 70%) OU admin aprovou manualmente
- `rejeitada`: Admin rejeitou manualmente

**Índices**: 
- UNIQUE (aluno_id, evento_id) - Impede presença duplicada
- INDEX em data_hora_registro para consultas rápidas
- INDEX em status para filtros de aprovação
#### GET `/`
- Página inicial com informações do sistema

#### GET `/presenca?token=XXX`
- Página para aluno registrar presença após escanear QR
- **Formulário simplificado (apenas 2 campos obrigatórios)**:
  - **CPF** (11 dígitos, com validação completa)
  - **Email** (formato válido)
  - ~~Nome completo~~ ❌ **Removido** - busca automática pelo CPF
- **Captura de selfie**: Apenas se `evento.requer_reconhecimento_facial = TRUE`
- **Fluxo**: Sistema busca aluno pelo CPF e valida se email corresponde

#### POST `/api/registrar-presenca`
- Registra presença do aluno
- **Body**: `{ token, cpf, email, selfie? (opcional - apenas se evento exigir) }`
- **Validações**:
  - CPF válido (algoritmo de dígitos verificadores)
  - CPF existe na tabela `alunos`
  - **Busca nome do aluno automaticamente pelo CPF**
  - **Email fornecido === email cadastrado do aluno**
  - Token válido e data corresponde ao dia atual
  - Sem duplicação (aluno + evento únicos)
  - **Verifica se evento exige reconhecimento facial**
  - **Se exige facial**: Selfie obrigatória + comparação (>= 70% auto-aprovado)
  - **Se não exige facial**: Aprovação automática instantânea
- **Response**: `{ success, message, aluno, presenca }`

#### GET `/api/evento-atual`
- Retorna dados do evento do sábado atual
- **Response**: `{ evento, ehSabado, totalAlunos }`

---

### 🔒 Admin (requer autenticação)

#### GET `/painel`
- Dashboard com lista de presenças do dia
- Atualização automática a cada 10s

#### GET `/api/lista-presenca`
- Lista todos os alunos com status (presente/ausente)
- **Response**: `[{ id, nome, presente, horaRegistro }]`

#### POST `/api/eventos`
- **✨ Novo**: Criar evento para data futura (geração antecipada de QR Code)
- **Body**: `{ data: "2026-04-19" }` (formato YYYY-MM-DD, deve ser sábado)
- **Response**: `{ evento, qrCodePath, token, dataCriacao }`
- Permite criar e imprimir QR Code com antecedência

#### GET `/api/qrcode/gerar`
- Gera QR Code para o sábado atual (se não existir)
- Retorna imagem do QR Code

#### GET `/admin/alunos`
- Interface CRUD de alunos

#### POST `/api/alunos`
- Criar novo aluno
- **Body**: `{ nome, cpf, matricula, email, telefone, foto_cadastro (base64 ou upload) }`
- **Validações**: CPF único, email válido, foto obrigatória

#### PUT `/api/alunos/:id`
- Atualizar aluno existente

#### DELETE `/api/alunos/:id`
- Desativar aluno (soft delete)

#### GET `/admin/admins` 🆕 **Novo**
- Interface CRUD de administradores (apenas super_admin)

#### POST `/api/admins` 🆕 **Novo**
- Criar novo administrador
- **Body**: `{ nome, email, senha, nivel_acesso }`
- **Restrição**: Apenas super_admin

#### PUT `/api/admins/:id` 🆕 **Novo**
- Atualizar administrador

#### DELETE `/api/admins/:id` 🆕 **Novo**
- Desativar administrador

#### GET `/admin/aprovacoes` 🆕 **Novo**
- Lista de presenças pendentes de aprovação manual
- Mostra: foto cadastro vs selfie, CPF, nome, % confiança

#### POST `/api/presencas/:id/aprovar` 🆕 **Novo**
- Admin aprova presença manualmente
- **Response**: `{ success, presenca }`

#### POST `/api/presencas/:id/rejeitar` 🆕 **Novo**
- Admin rejeita presença (fraude detectada)
- **Body**: `{ motivo }`
- **Response**: `{ success }`

#### GET `/admin/relatorios`
- Histórico de presenças
- Filtros por período, aluno, estatísticas

#### GET `/api/relatorios/export`
- Exportar CSV de presenças

---

## 🏗️ Implementação em Fases

### ✅ Fase 1: Setup e Estrutura Base (1-2 horas)
1. Inicializar projeto npm
2. Instalar dependências
3. Criar estrutura de pastas
4. Configurar .gitignore e .env
5. Setup básico do Express server

**Comandos**:
```bash
npm init -y
npm install express qrcode better-sqlite3 express-session ejs bcrypt dotenv express-validator
npm install -D nodemon
```

**Nota**: Para produção, adicionar depois: `npm install pg`

### ✅ Fase 2: Banco de Dados (2-3 horas)
1. Configurar better-sqlite3 e conexão
2. Criar `schema.sql` com DDL das 3 tabelas (alunos, eventos, presencas)
3. Criar `queries.js` com todas as queries SQL organizadas por entidade
4. Implementar inicialização automática do schema (se não existir)
5. Criar `seed.js` com dados de teste
6. Testar conexão e queries básicas

**Arquivos criados**:
- `src/config/database.js` - Conexão better-sqlite3
- `src/db/schema.sql` - CREATE TABLE
- `src/db/queries.js` - SELECT, INSERT, UPDATE, DELETE
- `src/db/seed.js` - INSERT de dados de teste

### ✅ Fase 3: Backend - Lógica de Eventos e QR Code (3-4 horas)
1. Implementar `dateHelper.js` (calcular próximo sábado, verificar se hoje é sábado, validar data)
2. Implementar `qrGenerator.js` (gerar QR Code com token único por data)
3. Criar endpoint `GET /api/evento-atual`
4. **✨ Criar endpoint `POST /api/eventos`** - Geração antecipada + configuração facial
5. Criar endpoint `GET /api/qrcode/gerar` - Gera para hoje se não existir
6. **✨ Criar endpoint `GET /api/eventos/:id/config`** - Retorna se evento exige facial
7. **Interface admin**: campo de seleção de data + checkbox "Exige reconhecimento facial?" + descrição
8. Validação: token válido apenas na data especificada

### ✅ Fase 4: Backend - Registro de Presença (3-4 horas)
1. Criar `presencaController.js`
2. **Implementar validações completas**:
   - Validador de CPF (algoritmo completo com dígitos verificadores)
   - CPF existe em `alunos` (pré-cadastrado pelo admin)
   - **Busca automática do nome do aluno pelo CPF**
   - **Valida se email fornecido === email cadastrado do aluno**
   - Token válido e data do token === data atual
   - **Verifica se evento.requer_reconhecimento_facial (TRUE/FALSE)**
   - Sem duplicação (aluno_id + evento_id únicos)
3. Endpoint `POST /api/registrar-presenca` com body: `{ token, cpf, email, selfie? (opcional) }`
4. Endpoint `GET /api/lista-presenca` com status de cada aluno
5. Endpoint `GET /api/eventos/:id/config` para verificar se evento exige facial
6. Testes unitários das validações (CPF, data, duplicação, email matching)

### ✅ Fase 5: Frontend - Página de Registro (3-4 horas)
1. Criar view `escanear.ejs`
2. **Formulário de identificação simplificado (apenas 2 campos obrigatórios)**:
   - **CPF** (máscara: 000.000.000-00, validação client-side)
   - **Email** (validação HTML5 type="email")
   - ~~Nome completo~~ ❌ **Removido** - busca automática pelo CPF
3. **Captura de selfie condicional**:
   - Fazer requisição `GET /api/eventos/:id/config` ao carregar página
   - Se `requer_reconhecimento_facial = TRUE`: Exibir câmera e canvas para selfie
   - Se `requer_reconhecimento_facial = FALSE`: Ocultar componente de câmera
4. JavaScript para:
   - Validar CPF no frontend antes de enviar
   - Capturar selfie apenas se obrigatório
   - Enviar requisição via Fetch (POST /api/registrar-presenca)
   - Exibir erros específicos (CPF inválido, não cadastrado, email incorreto, já registrado, data errada)
5. Feedback visual (sucesso com ✓ verde, erro em vermelho com mensagem)
6. Design responsivo mobile-first

### ✅ Fase 6: Frontend - Painel Administrativo (4-5 horas)
1. Criar view `painel.ejs`
2. Listar todos os alunos com indicadores visuais:
   - 🟢 Verde com ✓ para presentes
   - 🔴 Vermelho para ausentes
3. Implementar atualização automática (polling 10s)
4. Filtros (todos/presentes/ausentes)
5. Busca por nome
6. Display do QR Code atual para impressão

### ✅ Fase 7: CRUD de Alunos (3-4 horas)
1. Criar view `gerenciar-alunos.ejs`
2. Lista de alunos cadastrados
3. **Formulário de cadastro/edição com upload de foto**
4. Modal de confirmação para exclusão
5. Validações client-side e server-side
6. **Upload e armazenamento de foto de cadastro** (multer)

### ✅ Fase 7.5: CRUD de Administradores 🆕 **Nova** (2-3 horas)
1. Criar view `gerenciar-admins.ejs` (apenas super_admin)
2. Lista de admins cadastrados
3. Formulário de cadastro/edição
4. Seleção de nível de acesso (admin / super_admin)
5. Validações e segurança (senha forte)
6. Middleware para verificar `super_admin`

### ✅ Fase 8: Autenticação Admin (2-3 horas)
1. Criar tabela `admins` no schema.sql
2. View `admin-login.ejs`
3. Middleware `auth.js` para proteger rotas
4. Middleware `isSuperAdmin.js` para rotas de CRUD de admins
5. Express-session para gerenciar sessão
6. Logout
7. Script de seed para criar primeiro super_admin

### ✅ Fase 8.5: Reconhecimento Facial 🆕 **Nova** (6-8 horas)
1. **Escolher solução de reconhecimento facial**:
   - **Opção A**: Face-API.js (frontend, grátis, offline)
   - **Opção B**: AWS Rekognition (preciso, pago)
   - **Opção C**: Azure Face API (equilíbrio, free tier)
   - **Recomendação**: Face-API.js para MVP, migrar para cloud depois se necessário

2. **Implementar captura de selfie no formulário de registro**:
   - Acesso à câmera do celular (getUserMedia API)
   - Botão "Tirar Selfie" no formulário
   - Preview da foto antes de enviar

3. **Backend - comparação facial**:
   - Receber selfie (base64)
   - Buscar foto_cadastro do aluno
   - Comparar faces (gerar % de confiança)
   - Se >= 70% confiança: aprovar automaticamente (status='aprovada')
   - Se < 70%: marcar como pendente (status='pendente')

4. **Tratamento de erros**:
   - Face não detectada na selfie
   - Face não detectada na foto de cadastro
   - Múltiplas faces detectadas
   - Erro de câmera/permissão

5. **Testes com diferentes condições**:
   - Iluminação variável
   - Ângulos diferentes
   - Com/sem óculos
   - Ajuste do threshold de confiança

### ✅ Fase 8.6: Sistema de Aprovação Manual 🆕 **Nova** (3-4 horas)
1. Criar view `aprovacoes.ejs`
2. **Interface de aprovação**:
   - Lista de presenças com status='pendente'
   - Exibir lado a lado: foto cadastro vs selfie
   - Mostrar: nome, CPF, % confiança facial, horário
   - Botões: ✅ Aprovar / ❌ Rejeitar
3. Endpoints de aprovação/rejeição
4. Notificação/badge no painel com contador de pendentes
5. Log de quem aprovou/rejeitou (auditoria)

### ✅ Fase 9: Relatórios e Histórico (3-4 horas)
1. Página de relatórios
2. Filtros por período (data início/fim)
3. Estatísticas (% presença, frequência por aluno)
4. Exportação CSV
5. Gráficos simples (Chart.js - opcional)

### ✅ Fase 10: Migração para PostgreSQL e Deploy (3-4 horas)
1. Instalar driver `pg`
2. Atualizar `database.js` para usar Pool do PostgreSQL
3. Converter `schema.sql` para sintaxe PostgreSQL (incluindo tabela `admins`)
4. Adicionar `async/await` em `queries.js`
5. Atualizar controllers para async
6. Testar em ambiente de homologação
7. Deploy no Render/Railway com PostgreSQL
8. Testes finais em produção

**Tempo Total Estimado**: 40-55 horas (+ 13-18h com reconhecimento facial e CRUD admins)

---

## 🧪 Cenários de Teste

### Teste 1: Registro de Presença Bem-Sucedido
1. Acessar painel admin e gerar QR Code do sábado
2. Escanear QR Code no celular
3. Inserir CPF/matrícula válida
4. Verificar mensagem de sucesso
5. Confirmar que nome aparece verde no painel
6. Verificar registro no banco de dados

### Teste 2: Impedir Duplicação
1. Registrar presença de um aluno
2. Tentar registrar novamente o mesmo aluno no mesmo dia
3. Deve retornar erro "Presença já registrada"

### Teste 3: Token Inválido
1. Tentar acessar `/presenca?token=INVALIDO`
2. Deve retornar erro ou redirecionar para página de erro

### Teste 3.1: Token de Data Diferente (✨ novo)
1. Criar evento para sábado 26/04
2. No dia 19/04, tentar usar o token do dia 26/04
3. Deve retornar erro "QR Code inválido para a data de hoje"

### Teste 4: Aluno Não Cadastrado
1. Tentar registrar presença com CPF não existente
2. Deve retornar erro "Aluno não encontrado. Procure o administrador para cadastro."

### Teste 4.1: CPF Inválido (✨ novo)
1. Tentar registrar presença com CPF inválido (ex: "111.111.111-11")
2. Deve retornar erro "CPF inválido" antes de consultar banco

### Teste 5: Atualização em Tempo Real
1. Abrir painel em 2 navegadores diferentes
2. Registrar presença via celular
3. Ambos os painéis devem atualizar em até 10 segundos

### Teste 6: Mudança de Sábado
1. Simular mudança de data do sistema para próximo sábado
2. Verificar que novo QR Code é gerado automaticamente
3. Token antigo não deve funcionar
4. Lista de presenças deve resetar para novo evento

### Teste 7: Busca no Painel
1. Digitar nome parcial no campo de busca
2. Verificar filtragem em tempo real
3. Filtros "presentes" e "ausentes" funcionando

### Teste 8: Exportação de Relatório
1. Acessar página de relatórios
2. Selecionar período (últimos 4 sábados)
3. Exportar CSV
4. Verificar dados corretos no arquivo

### Teste 9: Criação Antecipada de Evento (✨ novo)
1. Admin acessa painel na quinta-feira (17/04)
2. Cria evento para sábado 19/04
3. QR Code gerado com sucesso
4. Admin baixa/imprime QR Code
5. Na quinta, tentar usar QR Code → erro "Evento ainda não começou"
6. No sábado 19/04, QR Code funciona normalmente
7. No sábado 26/04, QR Code do dia 19/04 não funciona mais

### Teste 10: Evento SEM Reconhecimento Facial (✨ novo)
1. Admin cria evento **desmarcando** checkbox "Exige reconhecimento facial"
2. Descrição: "Evento Grande - 200+ alunos"
3. Aluno escaneia QR Code
4. **Formulário exibe apenas**: CPF + Email (sem campo de nome, sem câmera)
5. Aluno preenche CPF: `12345678901`, Email: `joao@escola.com`
6. Sistema busca nome automaticamente pelo CPF → "João Silva"
7. Valida se email fornecido === email cadastrado → ✅ Matching
8. **Aprovação instantânea** (sem análise facial)
9. Nome "João Silva" aparece verde ✅ no painel imediatamente

### Teste 10.1: Evento COM Reconhecimento Facial (✨ novo)
1. Admin cria evento **marcando** checkbox "Exige reconhecimento facial"
2. Descrição: "Evento Regular - Validação de Identidade"
3. Aluno escaneia QR Code
4. **Formulário exibe**: CPF + Email + **Câmera para selfie**
5. Aluno preenche CPF: `98765432100`, Email: `maria@escola.com`
6. Sistema busca nome automaticamente → "Maria Santos"
7. Valida email → ✅ Matching
8. Aluno tira selfie clara
9. Sistema compara com foto cadastro: 85% similarity
10. **Aprovação automática** (>= 70%)
11. Nome "Maria Santos" aparece verde ✅ no painel

### Teste 10.2: Email Não Corresponde (✨ novo - validação de segurança)
1. Aluno escaneia QR (qualquer tipo de evento)
2. Preenche CPF: `12345678901` (João Silva - email: `joao@escola.com`)
3. **Preenche email diferente**: `hacker@fake.com`
4. Sistema busca nome pelo CPF → "João Silva"
5. Compara email fornecido vs cadastrado → ❌ **Email não corresponde**
6. **Erro exibido**: "Email não corresponde ao cadastrado para este CPF"
7. Presença **não registrada**

### Teste 10.3: Reconhecimento Facial Baixa Confiança (✨ novo)
1. Evento com facial habilitado
2. Aluno tira selfie com má iluminação / ângulo ruim
3. Sistema compara: 45% similarity (< 70%)
4. Status = **pendente** (não aparece no painel ainda)
5. Aluno vê: "Aguardando aprovação manual"
6. Admin acessa `/admin/aprovacoes`, vê foto cadastro vs selfie
7. Admin aprova manualmente → Nome aparece verde ✅ no painel

### Teste 14: CRUD de Administradores (✨ novo)
1. Super_admin acessa `/admin/admins`
2. Cria novo admin: João (nivel='admin')
3. Admin comum tenta acessar `/admin/admins` → erro 403
4. Super_admin edita nível de João para 'super_admin'
5. João agora consegue gerenciar admins

---

## 🔐 Variáveis de Ambiente (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
# Desenvolvimento (SQLite)
DATABASE_PATH=./database/automacao.db

# Produção (PostgreSQL) - adicionar quando migrar
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# Session
SESSION_SECRET=sua_chave_secreta_aqui_mude_em_producao

# Admin (temporário - migrar para banco depois)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$2b$10$...hash_bcrypt...

# App
APP_URL=http://localhost:3000
QR_CODE_FOLDER=./public/img/qrcodes
```

---

## 🚀 Deploy

### Opções de Hospedagem

#### 1. Render (Recomendado - Free Tier)
- PostgreSQL gratuito (1GB)
- Detecta automaticamente package.json
- HTTPS gratuito
- Fácil integração com GitHub

**Passos**:
1. Criar conta no Render
2. Criar banco PostgreSQL no Render
3. Conectar repositório GitHub
4. Configurar build command: `npm install`
5. Configurar start command: `npm start`
6. Adicionar variável `DATABASE_URL` (copiar do PostgreSQL)
7. Adicionar demais variáveis de ambiente

#### 2. Railway
- PostgreSQL incluído no free tier
- Deploy automático via GitHub
- Configuração simples

#### 3. Heroku
- Requer add-on PostgreSQL (Heroku Postgres)
- Requer Procfile
- SQLite requer buildpack adicional ou migrar para PostgreSQL
- Dynos gratuitos dormem após inatividade

**Procfile**:
```
web: node server.js
```

#### 4. Servidor Local/VPS
```bash
# Instalar Node.js
# Clonar repositório
npm install
npm start

# PM2 para manter rodando
npm install -g pm2
pm2 start server.js --name automacao-inova
pm2 save
pm2 startup
```

---

## 📝 Decisões Técnicas

### Por que SQL Puro (sem ORM)?
- ✅ **Controle total**: Você escreve exatamente a query que quer
- ✅ **Performance**: Sem overhead de abstração  
- ✅ **Debugging**: Vê exatamente o SQL executado
- ✅ **Simplicidade**: Não precisa aprender API do ORM
- ✅ **Domínio**: Você já tem expertise em SQL
- ✅ **Otimização**: Pode usar todos os recursos do banco

### Por que SQLite (Dev) → PostgreSQL (Prod)?
**SQLite para Desenvolvimento:**
- ✅ **Setup instantâneo** - zero configuração
- ✅ **Trabalha offline** - não precisa de servidor
- ✅ **Debug fácil** - arquivo .db pode ser aberto diretamente
- ✅ **Rápido para prototipar** - foco na lógica

**PostgreSQL para Produção:**
- ✅ **Dados seguros** - redundância e backup automático
- ✅ **Sem perda de dados** - não depende de arquivo único
- ✅ **Melhor para relatórios** - queries complexas otimizadas
- ✅ **Concorrência real** - múltiplos acessos simultâneos
- ✅ **Robusto** - usado em produção por grandes empresas

**Migração é fácil:**
- 95% das queries SQL são idênticas
- Principais mudanças: `INTEGER` → `SERIAL`, operações `async/await`
- Mesmo SQL, diferente driver

### Por que EJS (e não React)?
- ✅ Sintaxe simples, similar ao HTML puro
- ✅ Não requer build/transpilação
- ✅ SSR (Server-Side Rendering) direto
- ✅ Setup zero - já funciona com Express
- ✅ Para este caso de uso: mais rápido que React
- ✅ Menos complexidade, foco no problema real

### Fluxo do QR Code
**Token único por sábado** (escolha recomendada):

**Formato do Token**: `SAB_YYYYMMDD_HASH`
- Exemplo: `SAB_20260419_A7B3C9D2`

**URL Gerada**: `http://seusite.com/presenca?token=SAB_20260419_A7B3C9D2`

**✨ Geração Antecipada** (novo requisito):
- Admin pode criar evento para **qualquer data futura**
- Sistema gera QR Code com token específico daquela data
- Admin **imprime** com antecedência (ex: quinta-feira para sábado)
- Token é válido **apenas na data especificada**
- Validação no backend: `data_token === data_atual`

**Exemplo de Uso**:
1. **Quinta (17/04)**: Admin cria evento para sábado 19/04
2. Sistema gera: `SAB_20260419_A7B3C9D2.png`
3. Admin imprime o QR Code
4. **Sábado (19/04)**: Alunos escaneiam o QR impresso
5. Sistema valida: token válido apenas hoje (19/04)

**Vantagens**:
- ✅ Um único QR Code impresso/projetado no local
- ✅ Criação com antecedência para planejamento
- ✅ Simples de usar para alunos
- ✅ Token expira automaticamente quando muda de sábado
- ✅ Impede fraude retroativa (não pode marcar presença de dia anterior)
- ✅ Impede uso em data diferente da programada
- ✅ Fácil de validar no backend

**Alternativa Rejeitada**: QR Code individual por aluno
- ❌ Complexidade desnecessária
- ❌ Cada aluno precisaria de seu próprio QR Code
- ❌ Difícil impressão e distribuição

### Atualização do Painel
**Polling a cada 10 segundos**:
- ✅ Simples de implementar (setInterval + fetch)
- ✅ Suficiente para o caso de uso (não precisa ser instantâneo)
- ✅ Não sobrecarrega servidor
- ✅ Funciona em qualquer navegador

**Código Frontend**:
```javascript
setInterval(() => {
  fetch('/api/lista-presenca')
    .then(res => res.json())
    .then(data => atualizarLista(data));
}, 10000); // 10 segundos
```

**Alternativa Futura**: WebSocket para tempo real instantâneo
- Socket.io se precisar de atualizações imediatas
- Mais complexo, necessário apenas se houver centenas de registros/minuto

### Reconhecimento Facial: Face-API.js 🆕
**Por que Face-API.js?**
- ✅ Gratuito e open-source
- ✅ Roda no navegador (privacidade dos dados)
- ✅ Não precisa de servidor externo
- ✅ Funciona offline
- ✅ Bom para MVP e validação do conceito
- ✅ Modelos pré-treinados inclusos

**Como Funciona**:
```javascript
// 1. Carregar modelos (uma vez)
await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

// 2. Detectar face na foto de cadastro
const fotoCadastro = await faceapi.fetchImage(urlFotoCadastro);
const descriptorCadastro = await faceapi
  .detectSingleFace(fotoCadastro)
  .withFaceLandmarks()
  .withFaceDescriptor();

// 3. Detectar face na selfie
const selfie = await faceapi.fetchImage(urlSelfie);
const descriptorSelfie = await faceapi
  .detectSingleFace(selfie)
  .withFaceLandmarks()
  .withFaceDescriptor();

// 4. Comparar (distância euclidiana)
const distancia = faceapi.euclideanDistance(
  descriptorCadastro.descriptor, 
  descriptorSelfie.descriptor
);

// 5. Converter para % de confiança
const confianca = Math.round((1 - distancia) * 100);

// 6. Decidir
if (confianca >= 70) {
  // Aprovar automaticamente
} else {
  // Enviar para aprovação manual
}
```

**Threshold Recomendado**: 70%
- < 50%: Pessoas diferentes (rejeitar)
- 50-69%: Duvidoso (aprovação manual)
- 70-85%: Mesma pessoa (aprovar)
- > 85%: Alta confiança (aprovar)

**Alternativas Cloud** (se precisar de mais precisão depois):
- **Azure Face API**: $1/1000 comparações, free tier 30k/mês
- **AWS Rekognition**: $1/1000 comparações
- **Google Cloud Vision**: $1.50/1000 comparações

---

## 🔄 Guia de Migração: SQLite → PostgreSQL

### Quando Migrar?
✅ **Antes do deploy em produção** (Semana 3 do cronograma)

### Checklist de Migração

#### 1. Instalar Dependências
```bash
npm install pg
```

#### 2. Criar Banco PostgreSQL
- Render.com: Dashboard → New → PostgreSQL
- Copiar `DATABASE_URL` (formato: `postgresql://user:pass@host:5432/db`)

#### 3. Atualizar `src/config/database.js`

**Antes (SQLite):**
```javascript
const Database = require('better-sqlite3');
const db = new Database('./database/automacao.db');
db.pragma('foreign_keys = ON');
module.exports = db;
```

**Depois (PostgreSQL):**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
```

#### 4. Atualizar `src/db/schema.sql`

**SQLite → PostgreSQL:**
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- `INTEGER` (boolean) → `BOOLEAN`
- `DATETIME` → `TIMESTAMP`
- `TEXT` → `VARCHAR(n)` ou `TEXT`

#### 5. Atualizar `src/db/queries.js`

**Antes (SQLite - síncrono):**
```javascript
getAllAlunos: () => {
  return db.prepare('SELECT * FROM alunos WHERE ativo = 1').all();
}
```

**Depois (PostgreSQL - assíncrono):**
```javascript
getAllAlunos: async (pool) => {
  const result = await pool.query('SELECT * FROM alunos WHERE ativo = true');
  return result.rows;
}
```

#### 6. Atualizar Controllers (adicionar async/await)

**Antes:**
```javascript
const alunos = queries.getAllAlunos();
```

**Depois:**
```javascript
const alunos = await queries.getAllAlunos(pool);
```

#### 7. Testar Tudo Localmente
- Conectar PostgreSQL local ou usar ElephantSQL free tier
- Rodar todas as queries
- Testar todos os endpoints

#### 8. Deploy
- Adicionar `DATABASE_URL` nas variáveis de ambiente
- Deploy no Render/Railway
- Executar schema no banco de produção

---

## 🎨 Design do Painel

### Layout Desktop

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Painel de Presença - Sábado 19/04/2026                 │
│  ────────────────────────────────────────────────────────   │
│                                                              │
│  ┌──────────────┐    Total: 45    Presentes: 32    ❌ 13   │
│  │              │                                            │
│  │  [QR CODE]   │    🔍 [Buscar aluno...]                   │
│  │              │    [📊 Todos] [✅ Presentes] [❌ Ausentes]│
│  │              │                                            │
│  └──────────────┘                                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Nome                CPF/Mat.      Hora      Status    │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  ✅ João Silva      123.456      08:35      🟢        │ │
│  │  ✅ Maria Santos    789.012      08:42      🟢        │ │
│  │  ❌ Pedro Oliveira  345.678        --       🔴        │ │
│  │  ✅ Ana Costa       901.234      09:01      🟢        │ │
│  │  ❌ Carlos Souza    567.890        --       🔴        │ │
│  │  ✅ Júlia Lima     012.345      09:15      🟢        │ │
│  │  ...                                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [🔧 Gerenciar Alunos]  [📊 Relatórios]  [🚪 Sair]         │
└─────────────────────────────────────────────────────────────┘
```

### Cores e Indicadores

- **Verde (#28a745)** - Presente ✅
- **Vermelho (#dc3545)** - Ausente ❌
- **Cinza claro (#f8f9fa)** - Background das linhas alternadas
- **Azul (#007bff)** - Botões de ação

---

## 📚 Recursos e Bibliotecas

### Dependências Principais

```javascript
// server.js
const express = require('express');
const session = require('express-session');
const QRCode = require('qrcode');
const { Sequelize } = require('sequelize');

// Estrutura básica
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### Bibliotecas Úteis Extras

- `helmet` - Segurança HTTP headers
- `morgan` - Logger de requisições HTTP
- `cors` - Se precisar de API externa
- `compression` - Compressão gzip
- `express-rate-limit` - Proteção contra DDoS

### Melhorias Futuras

- [ ] PWA (Progressive Web App) - funcionar offline
- [ ] Notificações push quando aluno registra presença
- [ ] Integração com WhatsApp API para avisos automáticos
- [ ] Dashboard com gráficos de estatísticas (Chart.js)
- [ ] Múltiplos programas/turmas
- [ ] Captura de foto no momento do registro (câmera)
- [ ] Biometria ou reconhecimento facial
- [ ] App mobile nativo (React Native/Flutter)
- [ ] Exportação para PDF além de CSV
- [ ] Integração com Google Calendar
- [ ] Sistema de pontos/gamificação para incentivar presença

---

## 🔒 Segurança

### Implementações de Segurança

1. **Validação de Entrada**
   - Sanitizar todos os inputs (express-validator)
   - **SQL Injection**: Usar prepared statements (queries.js já usa `?` placeholders)
   - **Validação completa de CPF**:
     - Algoritmo de dígitos verificadores
     - Verificar se CPF existe na tabela `alunos`
     - Formato: 000.000.000-00 (11 dígitos)
   - **Validação de email**: formato válido (regex ou validator.js)
   - **Validação de token**: data do token corresponde à data atual
   - **Validação de data**: ao criar evento futuro, verificar se é sábado

2. **Autenticação**
   - Senha com bcrypt (hash)
   - Session cookies HTTP-only
   - Timeout de sessão (30 minutos)

3. **Proteção de Rotas**
   - Middleware de autenticação em rotas admin
   - CSRF tokens (futuro)
   - Rate limiting para prevenir brute force

4. **Headers de Segurança**
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

5. **Logs de Auditoria**
   - Registrar todas as ações administrativas
   - IP e timestamp de cada registro de presença
   - Monitorar tentativas de acesso inválidas

---

## 📊 Métricas e Estatísticas

### Dashboard de Estatísticas

**Por Aluno**:
- Total de presenças
- % de frequência (presenças/eventos totais)
- Última presença registrada
- Faltas consecutivas

**Por Evento**:
- Total de presentes vs. ausentes
- Horário médio de chegada
- Taxa de presença geral (%)

**Geral**:
- Total de eventos realizados
- Média de presença por evento
- Alunos mais/menos frequentes
- Gráfico de evolução da frequência ao longo do tempo

---

## 🐛 Troubleshooting

### Problemas Comuns

**1. Erro: Cannot find module 'better-sqlite3'**
```bash
npm install better-sqlite3 --save
# Se não funcionar:
npm rebuild better-sqlite3
```

**2. QR Code não aparece**
- Verificar se pasta `public/img/qrcodes` existe
- Checar permissões de escrita

**3. Sessão expira muito rápido**
- Ajustar `maxAge` no express-session
- Verificar se `resave: false` está configurado

**4. Banco de dados não inicializa**
- Verificar caminho em `.env`
- Verificar se `schema.sql` existe e tem sintaxe correta
- Verificar permissões da pasta `database/`

**5. Atualização do painel não funciona**
- Verificar console do navegador (F12)
- Confirmar que endpoint `/api/lista-presenca` retorna dados

---

## 👨‍💻 Próximos Passos

### Checklist de Implementação

- [ ] 1. Inicializar projeto npm
- [ ] 2. Instalar todas as dependências
- [ ] 3. Criar estrutura de pastas
- [ ] 4. Configurar .gitignore e .env
- [ ] 5. Implementar conexão SQLite com better-sqlite3
- [ ] 6. Criar schema.sql (DDL das tabelas)
- [ ] 7. Criar queries.js com todas as queries organizadas
- [ ] 8. Criar seed.js e popular dados de teste
- [ ] 9. Implementar helpers (dateHelper, qrGenerator)
- [ ] 9. Criar rotas da API
- [ ] 10. Implementar controllers
- [ ] 11. Criar templates EJS
- [ ] 12. Implementar frontend (CSS/JS)
- [ ] 13. Testar fluxo completo localmente
- [ ] 14. Implementar autenticação admin
- [ ] 15. Adicionar validações e tratamento de erros
- [ ] 16. Implementar relatórios e exportação CSV
- [ ] 17. Polir UI/UX
- [ ] 18. Documentar código e README
- [ ] 19. Preparar para deploy
- [ ] 20. Deploy em produção
- [ ] 21. Testes finais com usuários reais

---

## 📞 Suporte e Documentação

### Documentação Oficial

- [Express.js](https://expressjs.com) - Framework web
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - Driver SQLite
- [node-postgres](https://node-postgres.com) - Driver PostgreSQL
- [QRCode npm](https://www.npmjs.com/package/qrcode) - Geração de QR Codes
- [EJS](https://ejs.co) - Template engine
- [SQLite](https://www.sqlite.org/docs.html) - Banco SQLite
- [PostgreSQL](https://www.postgresql.org/docs/) - Banco PostgreSQL

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia com nodemon (auto-reload)

# Produção
npm start                # Inicia servidor

# Banco de dados
npm run seed             # Popular dados de teste

# Testes
npm test                 # Executar testes (futuro)
```

---

## 🔐 Fluxo Completo do Sistema

### 📝 **Pré-Evento (Admin)**
1. **Cadastrar alunos** (CRUD)
   - Admin acessa `/admin/alunos`
   - Cadastra: CPF + Nome + Email + Telefone (opcional) + **Foto de rosto clara**
   - Alunos ficam na base `alunos`

2. **Criar evento futuro** (✨ com antecedência)
   - Admin seleciona data: ex. sábado 19/04/2026
   - Sistema gera token: `SAB_20260419_A7B3C9D2`
   - Sistema gera QR Code: `SAB_20260419_A7B3C9D2.png`
   - Admin **baixa/imprime** o QR Code

### 📱 **Dia do Evento (Alunos)**

#### **CENÁRIO A: Evento SEM Reconhecimento Facial** (Ex: Eventos grandes 200+ alunos)
1. **Admin configurou evento**: `requer_reconhecimento_facial = FALSE`
2. Aluno chega ao local
3. **Escaneia QR Code** impresso na entrada
4. Abre formulário no celular: `/presenca?token=SAB_20260419_A7B3C9D2`
5. **Sistema consulta** `GET /api/eventos/:id/config` → Facial desabilitada
6. **Formulário exibe apenas 2 campos**:
   - CPF: `123.456.789-00`
   - Email: `joao@email.com`
   - ~~Nome~~ ❌ **Oculto** (busca automática)
   - ~~Câmera~~ ❌ **Oculta** (não exigido)
7. Clica em "Confirmar Presença"
8. **Sistema valida dados**:
   - ✅ CPF válido (algoritmo)?
   - ✅ CPF existe em `alunos`? → Busca nome: "João Silva"
   - ✅ **Email fornecido === email cadastrado do aluno?**
   - ✅ Token válido e data é hoje (19/04)?
   - ✅ Aluno ainda não registrou presença hoje?
9. **Aprovação INSTANTÂNEA** (sem análise facial)
10. **Feedback**: Tela verde com ✓ "Presença confirmada, João Silva!"

---

#### **CENÁRIO B: Evento COM Reconhecimento Facial** (Ex: Eventos regulares com validação de identidade)
1. **Admin configurou evento**: `requer_reconhecimento_facial = TRUE`
2. Aluno chega ao local
3. **Escaneia QR Code** impresso na entrada
4. Abre formulário no celular: `/presenca?token=SAB_20260419_A7B3C9D2`
5. **Sistema consulta** `GET /api/eventos/:id/config` → Facial habilitada
6. **Formulário exibe 2 campos + câmera**:
   - CPF: `987.654.321-00`
   - Email: `maria@email.com`
   - ~~Nome~~ ❌ **Oculto** (busca automática)
   - **📸 Câmera ativa** para captura de selfie
7. **Tira selfie** (câmera frontal do celular)
8. Clica em "Confirmar Presença"
9. **Sistema valida dados**:
   - ✅ CPF válido (algoritmo)?
   - ✅ CPF existe em `alunos`? → Busca nome: "Maria Santos"
   - ✅ **Email fornecido === email cadastrado do aluno?**
   - ✅ Token válido e data é hoje (19/04)?
   - ✅ Aluno ainda não registrou presença hoje?
10. **Sistema compara faces automaticamente**:
    - 🔍 Compara selfie com foto de cadastro
    - Calcula % de confiança (0-100%)
    - **Se >= 70%**: ✅ Aprovado automaticamente (status='aprovada')
    - **Se < 70%**: ⏳ Enviado para aprovação manual (status='pendente')
11. **Feedback para aluno**:
    - **Aprovado**: Tela verde com ✓ "Presença confirmada, Maria Santos!"
    - **Pendente**: Tela amarela com ⏳ "Aguardando aprovação do administrador"
    - **Erro**: Tela vermelha com mensagem específica

---

### 🛡️ **Aprovação Manual (Admin)**
1. Admin vê notificação: "3 presenças pendentes"
2. Acessa `/admin/aprovacoes`
3. Vê lista com fotos lado a lado:
   - **Foto cadastro** | **Selfie do momento** | Nome | CPF | % Confiança
4. Admin analisa visualmente se é a mesma pessoa
5. Admin decide:
   - ✅ **Aprovar**: Presença confirmada (aparece verde no painel)
   - ❌ **Rejeitar**: Fraude detectada (motivo registrado)
- Registrar presença sem todos os campos obrigatórios (CPF, nome, email, selfie)
- Usar CPF inválido ou não cadastrado
- Registrar presença duplicada no mesmo evento
- Registrar presença sem foto de cadastro no sistema
- Admin comum gerenciar outros administradores
   - 🟢 Pedro Costa - 08:42 - Presente (Manual: Admin João)
3. Badge mostra: "⏳ 3 pendentes"
4. Painel atualiza automaticamente a cada 10s
5. Admin distribui crachás olhando quem está verde ✅

---

## 🧰 Regras de Negócio

### ✅ Permitido
- Admin criar evento para qualquer sábado futuro
- Admin configurar se evento exige reconhecimento facial (checkbox)
- Aluno confirmar presença apenas uma vez por evento
- Usar QR Code apenas na data especificada
- **Eventos sem facial**: Aprovação instantânea com CPF + email
- **Eventos com facial**: Similaridade >= 70% aprova automaticamente, < 70% envia para aprovação manual

### ❌ Proibido
- Aluno cadastrar-se sozinho (só admin cadastra)
- Usar QR Code em data diferente da programada
- Registrar presença sem todos os campos obrigatórios (CPF + email)
- **Email fornecido diferente do email cadastrado do aluno**
- Usar CPF inválido ou não cadastrado
- Registrar presença duplicada no mesmo evento

---

## 🧰 Validações Detalhadas

### Validação de CPF (Algoritmo Completo)
```javascript
function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (inválido)
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Valida dígito verificador 1
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  // Valida dígito verificador 2
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}
```

### Validação de Data do Token
```javascript
function validarDataToken(token) {
  // Extrai data do token: SAB_20260419_HASH
  const dataToken = token.split('_')[1]; // "20260419"
  const dataHoje = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // "20260419"
  
  return dataToken === dataHoje;
}
```

### Validação de Email
```javascript
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

---

## 🎓 Contexto do Projeto

**Objetivo**: Automatizar controle de presença em programa que ocorre aos sábados

**Problema Atual**: 
- Assinatura manual em papel
- Difícil controle de quem já assinou
- Distribuição de crachás desorganizada
- Sem histórico digital

**Solução Proposta**:
- QR Code gerado automaticamente a cada sábado
- Aluno escaneia e se identifica digitalmente
- Painel mostra em tempo real quem chegou (verde ✓) e quem não (vermelho)
- Responsável consegue distribuir crachás de forma organizada
- Histórico completo de todas as presenças
- Dados persistentes e confiáveis (PostgreSQL em produção)

**Benefícios**:
- ⏱️ Redução de 90% no tempo de registro
- 📊 Dados estruturados e relatórios automáticos
- 🎯 Controle visual imediato de quem está presente
- 🔒 Segurança contra fraudes (token único por dia)
- �️ **Reconhecimento facial impede assinaturas falsas**
- 👤 **Garantia de que foi o próprio aluno quem registrou**
- ✅ **Aprovação automática (70%+ confiança) ou manual**
- 📸 **Histórico fotográfico de todas as presenças**
- 👥 **Múltiplos administradores com níveis de acesso**
- �📱 Funciona em qualquer smartphone
- 🌐 Acesso de qualquer lugar (se hospedado na nuvem)
- 💾 Dados seguros e sem risco de perda (PostgreSQL)

---

## 📅 Cronograma Detalhado

### Semana 1: Fundação (10-13h)
- **Dias 1-2**: Setup inicial, estrutura, banco SQLite, queries
- **Dias 3-4**: Backend - APIs de evento e QR Code
- **Dia 5**: Backend - Sistema de registro de presença

### Semana 2: Interface Core (12-14h)
- **Dias 1-2**: Frontend - Página de registro + **captura selfie**
- **Dias 3-4**: Frontend - Painel administrativo
- **Dia 5**: CRUD de alunos + **upload foto**

### Semana 3: Reconhecimento Facial (10-12h)
- **Dias 1-2**: **Implementar Face-API.js e comparação**
- **Dia 3**: **Interface de aprovação manual**
- **Dia 4**: **Testes de reconhecimento facial**
- **Dia 5**: A2 (Atualizado com reconhecimento facial, CRUD de admins e sistema de aprovação manual

### Semana 4: CRUD Admins e Finalização (8-10h)
- **Dias 1-2**: **CRUD de administradores**
- **Dia 3**: **Migração SQLite → PostgreSQL**
- **Dia 4**: Polimento, testes, correções
- **Dia 5**: Deploy e documentação

**Total**: 4 semanas (40-49 horas de desenvolvimento)

---

## ✨ Considerações Finais

Este sistema foi planejado para ser:
- **Simples**: Tecnologias bem estabelecidas e documentadas
- **Eficiente**: Resolve o problema específico sem complexidade desnecessária
- **Escalável**: SQLite para dev rápido, PostgreSQL para prod robusta
- **Mantenível**: SQL puro, código organizado, fácil de entender
- **Seguro**: Dados persistentes e confiáveis em produção

**Estratégia de Desenvolvimento:**
1. **Desenvolver rápido com SQLite** (Semanas 1-2)
2. **Testar tudo localmente** (Semana 2)
3. **Migrar para PostgreSQL** (Semana 3)
4. **Deploy com confiança** (Semana 3)

O foco está em **resolver o problema real de forma prática**, com dados seguros e sem over-engineering.

---

**Autor**: GitHub Copilot  
**Data de Criação**: 17/04/2026  
**Versão**: 2.3 (Configuração flexível por evento + formulário simplificado CPF/Email)  
**Última Atualização**: 17/04/2026

---

## � Histórico de Versões

### v2.3 - Configuração Flexível por Evento (17/04/2026)
**Objetivos**: Permitir eventos grandes sem facial + melhorar UX com formulário simplificado

**Alterações**:
- ✅ **Tabela `eventos`**: +2 campos (`requer_reconhecimento_facial BOOLEAN`, `descricao VARCHAR(255)`)
- ✅ **Formulário simplificado**: CPF + email (nome removido - busca automática)
- ✅ **Validação de segurança**: Email fornecido deve corresponder ao email cadastrado
- ✅ **Captura de selfie condicional**: Apenas se `evento.requer_reconhecimento_facial = TRUE`
- ✅ **Novo endpoint**: `GET /api/eventos/:id/config` (retorna se exige facial)
- ✅ **Interface admin**: Checkbox "Exige reconhecimento facial?" ao criar evento
- ✅ **Testes atualizados**: 4 novos cenários (10, 10.1, 10.2, 10.3)

**Benefícios**:
- 🚀 **Flexibilidade**: Admin decide por evento (facial ON/OFF)
- ⚡ **Velocidade**: Eventos grandes aprovam instantaneamente com CPF+email
- 📊 **Escalabilidade**: 200+ alunos em poucos minutos
- 🔒 **Segurança mantida**: Validação de email + CPF garante identidade
- 💡 **UX melhorada**: Menos campos = mais rápido para o aluno

### v2.2 - Reconhecimento Facial e CRUD de Admins (16/04/2026)
**Objetivos**: Prevenir fraude na presença + gerenciar múltiplos administradores

**Alterações**:
- ✅ Sistema de reconhecimento facial (Face-API.js)
- ✅ Comparação automática foto cadastro vs selfie
- ✅ Threshold 70% para aprovação automática
- ✅ Sistema de aprovação manual para casos duvidosos
- ✅ CRUD completo de administradores
- ✅ Níveis de acesso: `admin` e `super_admin`

### v2.1 - Formulário Completo e Validações (15/04/2026)
**Objetivos**: Formulário de identificação robusto + QR Code antecipado

**Alterações**:
- ✅ Formulário com 3 campos: CPF, nome, email
- ✅ Validação completa de CPF (algoritmo)
- ✅ Geração de QR Code antecipada pelo admin
- ✅ Validação de data do token

### v2.0 - SQL Puro sem ORM (15/04/2026)
**Objetivos**: Substituir Sequelize por SQL nativo

**Alterações**:
- ✅ Remoção do Sequelize
- ✅ Queries SQL puras em `db/queries.js`
- ✅ Schema SQL em `db/schema.sql`

### v1.0 - Planejamento Inicial (14/04/2026)
**Objetivos**: Automatizar lista de presença com QR Code

**Alterações**:
- ✅ Stack definida: Node.js + Express + SQLite/PostgreSQL
- ✅ 3 tabelas: alunos, eventos, presencas
- ✅ 10 fases de implementação
- ✅ Painel administrativo com status visual

---

## �📝 Notas de Desenvolvimento

_Use este espaço para adicionar observações durante a implementação:_

### Desenvolvimento (SQLite)
- [ ] Setup inicial completo
- [ ] Schema SQL criado e testado
- [ ] Queries organizadas e funcionando
- [ ] Problemas encontrados e soluções

### Migração (PostgreSQL)
- [ ] Database.js atualizado
- [ ] Schema convertido
- [ ] Queries atualizadas para async
- [ ] Testes em homologação ok

### Produção
- [ ] Deploy realizado
- [ ] Dados migrados
- [ ] Testes com usuários reais
- [ ] Feedback coletado
- [ ] Melhorias identificadas

---

**🚀 Pronto para começar? Siga o plano fase por fase e boa sorte!**
