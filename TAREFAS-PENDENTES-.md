# Tarefas Pendentes para Iniciante

## Objetivo
Este documento lista as tarefas que ainda faltam no sistema, com foco em execucao por uma pessoa iniciante.

Prioridade principal: implementar CRUD de usuarios administrativos (tela + backend) de forma simples.

## Estado atual (resumo)
- Ja funciona: CRUD de alunos, CRUD de eventos, registro de presenca por QR, dashboard com polling, estatisticas.
- Ainda falta: modulo real de usuarios com niveis de acesso, camada de seguranca separada, validacoes de seguranca no backend e documentacao de testes.

## Como usar este arquivo
Para cada tarefa:
1. Leia o objetivo.
2. Va para as pastas e arquivos indicados.
3. Crie/altere exatamente o que esta listado.
4. Rode os testes manuais da tarefa.
5. Marque como concluida apenas se passar em todos os criterios de aceite.

---

## P0 - Bloqueante (fazer primeiro)

### Tarefa 1 - Criar CRUD de usuarios no backend (simples)
Status: PENDENTE

Objetivo:
Permitir criar, listar, editar e desativar usuarios do sistema sem depender de autenticacao/autorizacao nesta etapa.

Pastas e arquivos:
- Alterar: backend/src/database/schema.sql
- Criar: backend/src/routes/usuariosRoutes.js
- Criar: backend/src/controllers/usuarios/usuariosController.js
- Alterar: backend/src/routes/app.js
- Alterar: backend/package.json

Passo a passo exato:
1. Abrir backend/package.json e confirmar dependencia bcrypt.
2. Se nao existir bcrypt, adicionar em dependencies e rodar npm install na pasta backend.
3. Abrir backend/src/database/schema.sql e adicionar tabela usuarios (sem remover tabelas atuais).
4. Criar backend/src/controllers/usuarios/usuariosController.js com as funcoes listar, criar, atualizar e desativar.
5. Criar backend/src/routes/usuariosRoutes.js com as 4 rotas REST apontando para o controller.
6. Abrir backend/src/routes/app.js e registrar router.use('/usuarios', usuariosRoutes).
7. Subir o backend e testar as rotas via Postman/Insomnia.

Implementacao detalhada por arquivo:

1. backend/package.json
- Objetivo: garantir hash de senha.
- O que e bcrypt (explicacao simples):
   - bcrypt e uma biblioteca para transformar senha em hash seguro.
   - Hash e um texto criptografado de mao unica: nao deve ser possivel recuperar a senha original.
   - No sistema, nunca salvar senha pura; sempre salvar apenas senha_hash gerado com bcrypt.
- Fazer:
   1. Verificar se "bcrypt" existe em dependencies.
   2. Se nao existir, adicionar.
   3. Rodar: cd backend ; npm install

- Como instalar o bcrypt (passo a passo no Windows):
   1. Abrir terminal na pasta backend.
   2. Rodar: npm install bcrypt
   3. Confirmar no package.json que apareceu "bcrypt" em dependencies.
   4. Testar se instalou corretamente rodando no terminal:

```bash
node -e "const b=require('bcrypt'); console.log('bcrypt ok:', !!b.hashSync)"
```

   5. Resultado esperado: aparecer "bcrypt ok: true".
   6. Se der erro de modulo nao encontrado, rodar novamente:

```bash
npm install
```

   7. Se ainda falhar, apagar pasta node_modules da pasta backend e instalar de novo:

```bash
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install
```

2. backend/src/database/schema.sql
- Objetivo: criar tabela perfil e tabela usuarios com relacionamento por perfil_id.
- Fazer: adicionar bloco SQL abaixo no final do arquivo:

```sql
CREATE TABLE IF NOT EXISTS perfil (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   nome TEXT NOT NULL UNIQUE,
   descricao TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   nome TEXT NOT NULL,
   email TEXT NOT NULL UNIQUE,
   senha_hash TEXT NOT NULL,
   perfil_id INTEGER NOT NULL,
   ativo INTEGER NOT NULL DEFAULT 1,
   created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (perfil_id) REFERENCES perfil(id)
);
```

- Campos obrigatorios e descricao:
  1. Tabela perfil:
     - id (INTEGER, PK, autoincrement): identificador unico do perfil.
     - nome (TEXT, NOT NULL, UNIQUE): nome curto do perfil (ex.: operador, admin, super_admin).
     - descricao (TEXT, opcional): explica o que o perfil pode fazer.
  2. Tabela usuarios:
     - id (INTEGER, PK, autoincrement): identificador unico do usuario.
     - nome (TEXT, NOT NULL): nome completo do usuario.
     - email (TEXT, NOT NULL, UNIQUE): email de login e contato.
     - senha_hash (TEXT, NOT NULL): hash da senha com bcrypt.
     - perfil_id (INTEGER, NOT NULL, FK perfil.id): perfil de acesso do usuario.
     - ativo (INTEGER, NOT NULL, default 1): 1=ativo, 0=inativo.
     - created_at (TEXT, NOT NULL): data/hora de criacao.
     - updated_at (TEXT, NOT NULL): data/hora da ultima atualizacao.

3. backend/src/controllers/usuarios/usuariosController.js
- Objetivo: centralizar regras do CRUD.
- Fazer:
   1. Importar conexao do banco (mesmo padrao dos outros controllers do projeto).
   2. Importar bcrypt.
   3. Implementar 4 metodos:
      - listar: retorna usuarios ativos/inativos com campos seguros (nunca retornar senha_hash).
       - criar: valida nome/email/senha, verifica email duplicado, faz hash e salva.
      - atualizar: atualiza nome/email/perfil_id/ativo e senha (se enviada).
       - desativar: atualiza ativo=0 pelo id.
   4. Padronizar respostas com success + mensagem + dados.

4. backend/src/routes/usuariosRoutes.js
- Objetivo: expor endpoints.
- Fazer: criar router do Express com:
   1. GET / -> listar
   2. POST / -> criar
   3. PUT /:id -> atualizar
   4. DELETE /:id -> desativar

5. backend/src/routes/app.js
- Objetivo: registrar modulo novo.
- Fazer:
   1. Importar usuariosRoutes no topo.
   2. Adicionar: router.use('/usuarios', usuariosRoutes);
   3. Manter as rotas existentes sem alterar comportamento.

Contrato das rotas (esperado):
1. GET /api/usuarios
- 200: { success: true, data: [ ... ] }

2. POST /api/usuarios
- Body minimo:
```json
{
   "nome": "Maria Usuario",
   "email": "maria@empresa.com",
   "senha": "Senha123",
   "perfil_id": 2
}
```
- 201: criado com sucesso
- 409: email ja cadastrado
- 400: perfil_id inexistente ou invalido

3. PUT /api/usuarios/:id
- Body exemplo:
```json
{
   "nome": "Maria Usuario Atualizada",
   "email": "maria@empresa.com",
   "perfil_id": 3,
   "ativo": 1
}
```
- Se enviar senha, atualizar senha_hash com bcrypt.

4. DELETE /api/usuarios/:id
- Regra: soft delete (ativo = 0)
- 200: usuario desativado

O que criar:
1. Tabela perfil no schema:
   - id (INTEGER, PK, autoincrement)
   - nome (TEXT, unico, obrigatorio)
   - descricao (TEXT, opcional)
2. Tabela usuarios no schema:
   - id
   - nome
   - email (unico)
   - senha_hash
   - perfil_id (FK para perfil.id)
   - ativo
   - created_at
   - updated_at
3. Rotas:
   - GET /api/usuarios
   - POST /api/usuarios
   - PUT /api/usuarios/:id
   - DELETE /api/usuarios/:id (soft delete: ativo=0)
4. Controller com validacoes simples:
   - email unico
   - campos obrigatorios
   - perfil_id obrigatorio e existente na tabela perfil
   - senha com hash (bcrypt)

Regras obrigatorias para seguir:
1. Nunca salvar senha em texto puro.
2. Nunca retornar senha_hash na resposta da API.
3. Sempre validar id da rota (:id) como numero.
4. Sempre retornar status HTTP coerente (200, 201, 400, 404, 409, 500).
5. Sempre validar se perfil_id existe antes de criar/atualizar usuario.

O que alterar:
1. backend/src/routes/app.js para registrar usuariosRoutes.
2. backend/package.json para garantir dependencia bcrypt.

Criterios de aceite:
- Endpoints de CRUD de usuarios respondem corretamente.
- Email duplicado retorna 409.
- Senha nunca e salva em texto puro.
- Delete desativa (ativo=0), sem apagar fisicamente.

Teste manual:
1. Criar usuario novo via API.
2. Editar nome e nivel de acesso.
3. Desativar usuario.
4. Tentar criar com email duplicado e validar erro.
5. Confirmar no banco que senha foi salva como hash (texto criptografado).
6. Confirmar que GET /api/usuarios nao retorna campo senha_hash.

---

### Tarefa 2 - Criar tela de usuarios no frontend (SPA)
Status: PENDENTE

Objetivo:
Criar pagina visual para gerenciar usuarios do sistema dentro do frontend atual.

Pastas e arquivos:
- Criar: frontend/pages/usuarios.html
- Alterar: frontend/js/app.js
- Alterar: frontend/js/api.js
- Alterar: frontend/js/auth.js

Passo a passo exato:
1. Criar arquivo frontend/pages/usuarios.html com estrutura da pagina e script da propria tela.
2. Em frontend/js/app.js, adicionar rota /usuarios apontando para pages/usuarios.html.
3. Em frontend/js/api.js, criar funcoes para consumir CRUD de usuarios e listagem de perfis.
4. Em frontend/js/auth.js, manter o comportamento atual, apenas garantindo que nao quebre a navegacao da nova rota.
5. Carregar a pagina /usuarios e validar: lista, criar, editar e desativar.

Como a tela deve funcionar:
1. Ao abrir a pagina:
   - mostrar loading na tabela.
   - chamar API.listarUsuarios() e API.listarPerfis().
   - preencher tabela de usuarios.
   - preencher select de perfil no modal.
2. Ao clicar em Novo Usuario:
   - abrir modal vazio.
   - senha obrigatoria no cadastro.
3. Ao clicar em Editar:
   - abrir modal preenchido com dados do usuario.
   - senha opcional (so troca se usuario digitar nova senha).
4. Ao clicar em Desativar:
   - pedir confirmacao.
   - chamar API.removerUsuario(id).
   - recarregar tabela.
5. Feedback visual:
   - sucesso: mensagem verde.
   - erro: mensagem vermelha com texto da API.

Implementacao detalhada por arquivo:

1. frontend/pages/usuarios.html
- Objetivo: montar toda interface do CRUD.
- O que codar:
  1. Cabecalho da pagina com titulo e botao Novo Usuario.
  2. Tabela com colunas:
     - Nome
     - Email
     - Perfil
     - Status
     - Acoes
  3. Modal com formulario contendo:
     - id (hidden para edicao)
     - nome (text)
     - email (email)
     - senha (password)
     - perfil_id (select)
     - ativo (checkbox)
  4. Funcoes JS da pagina:
     - carregarUsuarios()
     - carregarPerfis()
     - abrirModalNovoUsuario()
     - abrirModalEditarUsuario(usuario)
     - fecharModalUsuario()
     - salvarUsuario(event)
     - confirmarDesativacao(id, nome)
     - renderizarTabela(usuarios)
     - mostrarMensagem(tipo, texto)

2. frontend/js/app.js
- Objetivo: habilitar rota da tela no SPA.
- O que codar:
  1. Adicionar rota:
     - '/usuarios': 'pages/usuarios.html'
  2. Garantir que o roteador carrega essa pagina como as demais.
  3. Nao mudar fluxo de rotas existentes.

3. frontend/js/api.js
- Objetivo: centralizar chamadas HTTP da tela de usuarios.
- O que codar (metodos novos):
  1. listarUsuarios()
     - GET /usuarios
  2. criarUsuario(payload)
     - POST /usuarios
  3. atualizarUsuario(id, payload)
     - PUT /usuarios/:id
  4. removerUsuario(id)
     - DELETE /usuarios/:id
  5. listarPerfis()
     - GET /perfis
     - Se endpoint ainda nao existir no backend, pode usar fallback temporario local:
       - [{ id: 1, nome: 'operador' }, { id: 2, nome: 'admin' }, { id: 3, nome: 'super_admin' }]

Contrato de dados da tela:
1. Usuario retornado pela API:
```json
{
  "id": 10,
  "nome": "Maria Usuario",
  "email": "maria@empresa.com",
  "perfil_id": 2,
  "perfil_nome": "admin",
  "ativo": 1,
  "created_at": "2026-04-18 09:10:00"
}
```
2. Perfil retornado pela API:
```json
{
  "id": 2,
  "nome": "admin",
  "descricao": "Acesso administrativo"
}
```

4. frontend/js/auth.js
- Objetivo: manter compatibilidade da sessao atual.
- O que codar:
  1. Nao remover funcoes existentes.
  2. Garantir que a pagina /usuarios nao quebra por falta de helper de sessao.
  3. Se a tela usar dados do usuario logado, usar funcoes ja existentes no arquivo.

Layout e comportamento recomendados:
1. Botoes da tabela:
   - Editar (btn-secondary)
   - Desativar (btn-danger)
2. Badge de status:
   - ativo=1: Ativo
   - ativo=0: Inativo
3. Select de perfil:
   - valor enviado no submit deve ser numero (perfil_id).
4. Confirmacao de desativacao:
   - texto: "Deseja desativar o usuario NOME?"

Fluxo de salvar (criar/editar):
1. Coletar dados do formulario.
2. Validar campos obrigatorios no frontend (nome, email, perfil_id).
3. Se cadastro novo, exigir senha.
4. Montar payload e chamar API correta:
   - sem id: API.criarUsuario(payload)
   - com id: API.atualizarUsuario(id, payload)
5. Em sucesso:
   - fechar modal
   - limpar formulario
   - recarregar tabela
   - mostrar mensagem de sucesso
6. Em erro:
   - manter modal aberto
   - mostrar mensagem retornada pela API

Erros que a tela deve tratar:
1. 400: dados invalidos.
2. 404: usuario nao encontrado na edicao/desativacao.
3. 409: email duplicado.
4. 500: erro interno.

O que criar:
1. Estrutura HTML completa da pagina usuarios.
2. Modal de formulario para criar e editar.
3. Script com funcoes de listagem, cadastro, edicao e desativacao.
4. Integracao com API.listarUsuarios, API.criarUsuario, API.atualizarUsuario, API.removerUsuario e API.listarPerfis.

O que criar:
1. Pagina usuarios.html com:
   - Titulo
   - Tabela de usuarios
   - Botao Novo Usuario
   - Modal de criar/editar
   - Botao desativar
2. Campos no formulario:
   - nome
   - email
   - senha (apenas criar ou quando trocar)
   - perfil_id (select de perfis)
   - ativo

O que alterar:
1. app.js:
   - adicionar rota /usuarios
   - manter como rota interna da SPA
2. api.js:
   - criar funcoes API.listarUsuarios
   - API.criarUsuario
   - API.atualizarUsuario
   - API.removerUsuario
3. auth.js:
   - manter somente utilitarios de sessao atuais nesta etapa

Regras obrigatorias para seguir:
1. Nunca exibir senha atual na tela.
2. No modo editar, campo senha deve ficar vazio por padrao.
3. Converter perfil_id para numero antes de enviar para API.
4. Sempre mostrar retorno de erro da API para o usuario.
5. Apos qualquer operacao (criar/editar/desativar), recarregar lista.

Criterios de aceite detalhados:
1. Rota /usuarios carrega sem erro de console.
2. Tabela renderiza usuarios vindos da API.
3. Select de perfil carrega opcoes corretamente.
4. Cadastro de usuario funciona com perfil_id valido.
5. Edicao funciona sem obrigar troca de senha.
6. Desativacao funciona com confirmacao previa.
7. Erro 409 de email duplicado aparece na tela.
8. A tabela atualiza automaticamente apos cada operacao.

Criterios de aceite:
- Pagina abre sem erro de script.
- Lista usuarios do backend.
- Cria, edita e desativa usuario pela interface.
- Mensagens de erro/sucesso aparecem de forma clara.

Teste manual:
1. Acessar /usuarios.
2. Criar usuario novo e ver na tabela.
3. Editar usuario e confirmar atualizacao na lista.
4. Desativar usuario e validar status.
5. Tentar criar usuario com email repetido e validar erro na UI.
6. Tentar salvar sem perfil_id e validar bloqueio no formulario.
7. Editar usuario sem informar senha e confirmar que atualiza normalmente.

---

### Tarefa 3 - Validacoes e acabamento do CRUD de usuarios
Status: PENDENTE

Objetivo:
Finalizar o CRUD de usuarios com validacoes simples para evitar erros comuns.

Pastas e arquivos:
- Alterar: frontend/pages/usuarios.html
- Alterar: frontend/js/api.js
- Alterar: backend/src/controllers/usuarios/usuariosController.js

O que criar:
1. Regras de validacao no frontend:
   - nome obrigatorio
   - email obrigatorio e valido
   - senha minima (quando criar/trocar)
2. Regras de validacao no backend:
   - campos obrigatorios
   - email unico
   - perfil_id valido e existente

O que alterar:
1. Ajustar exibicao de mensagens de erro no formulario.
2. Garantir que API trate 400 e 409 com mensagens amigaveis.

Criterios de aceite:
- Formulario bloqueia envio invalido.
- Backend rejeita payload invalido.
- Erros de duplicidade de email aparecem corretamente na tela.

Teste manual:
1. Tentar salvar sem nome.
2. Tentar salvar com email invalido.
3. Tentar cadastrar email repetido.
4. Corrigir dados e salvar com sucesso.

---

### Tarefa 4 - Adicionar seguranca de acesso por nivel (tarefa separada)
Status: PENDENTE

Objetivo:
Implementar autenticacao e autorizacao para proteger rotas administrativas apos o CRUD de usuarios estar pronto.

Pastas e arquivos:
- Criar: backend/src/routes/authRoutes.js
- Criar: backend/src/controllers/auth/authController.js
- Criar: backend/src/middleware/auth.js
- Criar: backend/src/middleware/authorization.js
- Alterar: backend/src/routes/app.js
- Alterar: frontend/pages/login.html
- Alterar: frontend/js/auth.js
- Alterar: frontend/js/api.js

O que alterar:
1. Criar endpoints:
   - POST /api/auth/login
   - POST /api/auth/logout
   - GET /api/auth/me
2. auth.js deve salvar sessao/token e dados do usuario.
3. Criar middleware para bloquear rotas sem autenticacao.
4. Criar middleware para permissoes por perfil_id (consultando a tabela perfil).
5. Proteger rotas de usuarios para permitir apenas perfis autorizados.
6. Logout deve limpar sessao/token e redirecionar para login.

Criterios de aceite:
- Login invalido mostra mensagem clara.
- Login valido redireciona para dashboard.
- Sessao expirada redireciona para login.
- Logout encerra sessao corretamente.
- Rotas sem permissao retornam 403.

Teste manual:
1. Tentar login com senha errada.
2. Fazer login valido.
3. Navegar em rota protegida.
4. Fazer logout e tentar voltar usando URL direta.
5. Logar com perfil sem permissao e testar acesso restrito.

---

## P1 - Estabilizacao (fazer apos P0)

### Tarefa 5 - Restringir CORS no backend
Status: PENDENTE

Pastas e arquivos:
- Alterar: backend/server.js

O que fazer:
- Trocar origin '*' por whitelist de origens permitidas.
- Permitir localhost:3000 e IP local de desenvolvimento.

Criterio de aceite:
- Origem permitida funciona, origem nao permitida bloqueia.

---

### Tarefa 6 - Validacao de CPF no backend
Status: PENDENTE

Pastas e arquivos:
- Criar: backend/src/utils/cpfValidator.js
- Alterar: backend/src/controllers/alunos/alunosController.js
- Alterar: backend/src/controllers/presencas/presencasController.js

O que fazer:
- Implementar algoritmo de CPF (digitos verificadores).
- Usar validacao ao criar aluno e ao registrar presenca.

Criterio de aceite:
- CPF invalido e rejeitado no backend com erro 400.

---

### Tarefa 7 - Padronizar tratamento de erros da API
Status: PENDENTE

Pastas e arquivos:
- Criar: backend/src/middleware/errorHandler.js
- Alterar: controllers backend (todos os relevantes)
- Alterar: backend/server.js

O que fazer:
- Resposta padrao para erro:
  - success: false
  - mensagem clara
  - status HTTP correto
- Evitar retorno de stack trace para frontend.

Criterio de aceite:
- Erros 400, 401, 403, 404, 409, 500 retornam formato padrao.

---

### Tarefa 8 - Criar checklist de testes manuais
Status: PENDENTE

Pastas e arquivos:
- Criar: TESTES-MANUAIS.md

O que fazer:
- Documentar roteiro de testes para:
  - login/logout
  - CRUD usuarios
  - CRUD alunos
  - CRUD eventos
  - registro presenca por QR
  - dashboard atualizando

Criterio de aceite:
- Qualquer pessoa do time consegue testar sem ajuda adicional.

---

## P2 - Evolucao (nao bloqueante)

### Tarefa 9 - Fluxo de aprovacoes manuais de presenca
Status: PENDENTE

Pastas e arquivos (sugestao):
- Alterar: backend/src/controllers/presencas/presencasController.js
- Criar: frontend/pages/aprovacoes.html

Descricao:
- Incluir status pendente/aprovada/rejeitada e tela para aprovacao manual.

---

### Tarefa 10 - Melhorias operacionais
Status: PENDENTE

Itens sugeridos:
- Exportacao CSV de presencas.
- Script de backup do banco.
- Guia de deploy local/rede (DEPLOY.md).

---

## Ordem recomendada para a iniciante
1. Tarefa 1
2. Tarefa 2
3. Tarefa 3
4. Tarefa 4
5. Tarefa 5
6. Tarefa 6
7. Tarefa 7
8. Tarefa 8
9. Tarefa 9 (opcional)
10. Tarefa 10 (opcional)

## Definicao de pronto (geral)
Uma tarefa so pode ser considerada concluida quando:
1. Codigo implementado no arquivo correto.
2. Fluxo manual testado ponta a ponta.
3. Sem erro de console no frontend.
4. Sem erro nao tratado no backend.
5. Documentacao da tarefa atualizada.
