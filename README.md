# Automação Inova — Sistema de Presença com QR Code

Sistema web para registro de presença via QR Code, com dashboard em tempo real, gestão de alunos e estatísticas.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- Terminal (PowerShell, CMD ou bash)

---

## Estrutura do Projeto

```
Automacao-Inova/
├── backend/        → API REST (Node.js + Express + SQLite)
└── frontend/       → Interface web (HTML/CSS/JS puro)
```

---

## Como Rodar

### 1. Backend (API)

Abra um terminal na pasta `backend`, instale as dependências e inicie o servidor:

```bash
cd backend
npm install
npm start
```

O servidor sobe em `http://localhost:5000`.

> Para desenvolvimento com reinício automático ao salvar:
> ```bash
> npm run dev
> ```

---

### 2. Frontend (Interface Web)

Abra **outro terminal** na pasta `frontend` e sirva os arquivos estáticos:

```bash
cd frontend
npx serve -l 3000
```

Acesse no navegador: `http://localhost:3000`

---

## Acessando pelo Celular (QR Code)

Para que o celular consiga escanear o QR e acessar o sistema, abra o frontend pelo **IP da sua máquina** (não pelo `localhost`):

1. Descubra seu IP local:
   ```powershell
   ipconfig
   ```
   Procure o IPv4 da sua rede (ex: `192.168.100.180`).

2. Acesse no navegador do PC pelo IP:
   ```
   http://192.168.100.180:3000
   ```

3. O QR Code gerado já terá o IP correto — o celular conseguirá abrir a página de presença normalmente.

---

## Login de Administrador

> O sistema usa autenticação simples via localStorage por enquanto.  
> Usuário padrão definido no backend.

---

## Fluxo de Uso

1. **Admin** abre o dashboard: `http://<IP>:3000`
2. Vai em **Eventos** → cria um evento → clica em **Ver QR**
3. Projeta ou imprime o QR Code na sala
4. **Alunos** escaneiam o QR com o celular
5. Preenchem CPF + e-mail (e selfie, se o evento exigir)
6. Presença confirmada aparece no **Dashboard** em até 10 segundos automaticamente

---

## Endpoints Principais da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/eventos` | Lista todos os eventos |
| POST | `/api/eventos` | Cria novo evento |
| PUT | `/api/eventos/:id` | Edita evento |
| PATCH | `/api/eventos/:id/toggle` | Ativa/desativa evento |
| GET | `/api/evento-atual?token=XYZ` | Valida token do QR Code |
| POST | `/api/registrar-presenca` | Registra presença do aluno |
| GET | `/api/lista-presenca` | Lista alunos + status do dia |
| GET | `/api/estatisticas` | Dados para relatórios |
| GET | `/api/alunos` | Lista alunos cadastrados |
| POST | `/api/alunos` | Cadastra novo aluno |
| PUT | `/api/alunos/:id` | Edita aluno |
| DELETE | `/api/alunos/:id` | Remove aluno (soft delete) |

---

## Banco de Dados

SQLite — arquivo criado automaticamente em `backend/src/database/automacao.db` na primeira execução. Não precisa instalar nada além do `npm install`.
