# Atualizações Para PLANO.md - Versão 2.3

## 📋 Mudanças a Aplicar Manualmente

### 1. Adicionar Cabeçalho e Campos na Tabela `eventos` (linha ~164)

**PROCURAR POR:**
```markdown
- `super_admin`: Tudo + gerenciar outros admins
| id | INTEGER PK | ID único do evento |
```

**SUBSTITUIR POR:**
```markdown
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
```

---

### 2. Atualizar Rota `GET /presenca?token=XXX` (linha ~197)

**PROCURAR POR:**
```markdown
#### GET `/presenca?token=XXX`
- Página para aluno registrar presença após escanear QR
- **Formulário de identificação (todos obrigatórios)**:
  - CPF (11 dígitos, com validação completa)
  - Nome completo
  - Email (formato válido)
- **Fluxo**: Aluno já deve estar cadastrado pelo admin (valida CPF na base)
```

**SUBSTITUIR POR:**
```markdown
#### GET `/presenca?token=XXX`
- Página para aluno registrar presença após escanear QR
- **Formulário simplificado (apenas 2 campos obrigatórios)**:
  - **CPF** (11 dígitos, com validação completa)
  - **Email** (formato válido)
  - ~~Nome completo~~ ❌ **Removido** - busca automática pelo CPF
- **Captura de selfie**: Apenas se `evento.requer_reconhecimento_facial = TRUE`
- **Fluxo**: Sistema busca aluno pelo CPF e valida se email corresponde
```

---

### 3. Atualizar Rota `POST /api/registrar-presenca` (linha ~205)

**PROCURAR POR:**
```markdown
#### POST `/api/registrar-presenca`
- Registra presença do aluno
- **Body**: `{ token, cpf, nome, email }`
- **Validações**:
  - CPF válido (algoritmo de dígitos verificadores)
  - CPF existe na tabela `alunos`
  - Token válido e data corresponde ao dia atual
  - Sem duplicação (aluno + evento únicos)
- **Response**: `{ success, message, aluno, presenca }`
```

**SUBSTITUIR POR:**
```markdown
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
```

---

### 4. Adicionar Novo Endpoint (após POST /api/eventos)

**ADICIONAR APÓS A ROTA `POST /api/eventos`:**
```markdown
#### GET `/api/eventos/:id/config` 🆕 **Novo**
- Retorna configuração do evento (se exige facial)
- **Response**: `{ requer_reconhecimento_facial, descricao }`
- Usado pelo frontend para mostrar/ocultar botão de selfie
```

---

### 5. Atualizar Fase 4 - Backend Registro de Presença

**PROCURAR A FASE 4 E SUBSTITUIR AS VALIDAÇÕES POR:**
```markdown
2. **Implementar validações completas**:
   - Validador de CPF (algoritmo completo com dígitos verificadores)
   - CPF existe em `alunos` (pré-cadastrado pelo admin)
   - **Buscar dados do aluno automaticamente pelo CPF** (nome, email)
   - **Email fornecido === email cadastrado do aluno**
   - Token válido e data do token === data atual
   - Sem duplicação (aluno_id + evento_id únicos)
   - **Verificar se evento exige reconhecimento facial**
   - Se exige facial: validar selfie obrigatória + comparar faces
   - Se não exige facial: aprovar automaticamente (status='aprovada')
3. Endpoint `POST /api/registrar-presenca` com body: `{ token, cpf, email, selfie? }`
```

---

### 6. Atualizar Fase 5 - Frontend Página de Registro

**PROCURAR A FASE 5 E SUBSTITUIR POR:**
```markdown
### ✅ Fase 5: Frontend - Página de Registro (3-4 horas)
1. Criar view `escanear.ejs`
2. **Formulário simplificado (apenas 2 campos obrigatórios)**:
   - **CPF** (máscara: 000.000.000-00, validação client-side)
   - **Email** (validação HTML5 type="email")
   - ~~Nome~~ ❌ **Removido** - sistema busca automaticamente pelo CPF
3. **Captura de selfie condicional**:
   - Ao carregar página: consultar `GET /api/eventos/:id/config`
   - Se `requer_reconhecimento_facial = TRUE`: mostrar botão "Tirar Selfie" (obrigatório)
   - Se `requer_reconhecimento_facial = FALSE`: ocultar seção de câmera completamente
4. JavaScript para:
   - Validar CPF no frontend antes de enviar
   - Verificar se evento exige facial e capturar selfie apenas se necessário
   - Enviar requisição via Fetch (POST /api/registrar-presenca)
   - Exibir erros específicos:
     - "CPF inválido"
     - "Aluno não cadastrado"
     - "Email não corresponde ao cadastro"
     - "Selfie obrigatória para este evento"
     - "Presença já registrada"
5. Feedback visual:
   - Sucesso: ✓ verde "Presença confirmada, [Nome do Aluno]!" (mostra nome buscado)
   - Erro: vermelho com mensagem específica
6. Design responsivo mobile-first
```

---

### 7. Atualizar Seção "Fluxo Completo do Sistema" - Dia do Evento

**PROCURAR "### 📱 **Dia do Evento (Alunos)**" E SUBSTITUIR POR:**
```markdown
### 📱 **Dia do Evento (Alunos)**

**Cenário 1: Evento COM Reconhecimento Facial**
1. Aluno chega ao local e **escaneia QR Code**
2. Abre formulário: `/presenca?token=SAB_20260419_A7B3C9D2`
3. **Formulário mostra**: CPF + Email + **Botão "Tirar Selfie"**
4. Preenche:
   - CPF: `123.456.789-00`
   - Email: `joao@email.com`
5. **Tira selfie obrigatória** 📸 (câmera frontal)
6. Clica "Confirmar Presença"
7. Sistema valida e compara faces:
   - ✅ Se >= 70% confiança: Aprovado automático
   - ⏳ Se < 70%: Enviado para aprovação manual
8. Feedback: "Presença confirmada, João Silva!" (mostra nome buscado)

**Cenário 2: Evento SEM Reconhecimento Facial**
1. Aluno chega ao local e **escaneia QR Code**
2. Abre formulário: `/presenca?token=SAB_20260426_X8Y9Z1`
3. **Formulário mostra**: Apenas CPF + Email (sem câmera)
4. Preenche:
   - CPF: `123.456.789-00`
   - Email: `joao@email.com`
5. Clica "Confirmar Presença"
6. Sistema valida:
   - ✅ CPF válido?
   - ✅ CPF existe?
   - ✅ Busca nome: "João Silva"
   - ✅ Email corresponde ao cadastrado?
7. **Aprovação instantânea** (sem espera)
8. Feedback: "Presença confirmada, João Silva!"

**Validações Comuns (ambos cenários)**:
- CPF válido (algoritmo)
- CPF existe na base
- Email fornecido === email cadastrado
- Token válido para hoje
- Sem duplicação
```

---

### 8. Atualizar "Regras de Negócio"

**NA SEÇÃO "✅ Permitido", ADICIONAR:**
```markdown
- **Admin configurar por evento se exige ou não reconhecimento facial**
- **Sistema buscar nome do aluno automaticamente pelo CPF**
- **Eventos grandes sem facial: aprovação instantânea**
```

**NA SEÇÃO "❌ Proibido", ADICIONAR:**
```markdown
- **Registrar presença com email diferente do cadastrado no sistema**
- **Registrar presença em evento COM facial sem enviar selfie**
- **Aluno digitar nome manualmente** (sistema busca pelo CPF)
```

---

### 9. Adicionar Novos Testes (após Teste 10)

**SUBSTITUIR O TESTE 10 E ADICIONAR NOVOS:**
```markdown
### Teste 10: Formulário Simplificado e Validação de Email (✨ novo)
1. Escanear QR Code válido
2. Formulário mostra apenas: CPF + Email (sem campo nome)
3. Deixar campo vazio → erro "Campo obrigatório"
4. Inserir CPF inválido (11 iguais) → erro "CPF inválido"
5. Inserir email inválido → erro "Email inválido"
6. **Inserir CPF 123.456.789-00 com email diferente do cadastrado**:
   - Email cadastrado: joao@email.com
   - Email digitado: maria@email.com
   - Erro: "Email não corresponde ao cadastro"
7. Inserir CPF e email corretos → **sistema busca "João Silva" automaticamente**
8. Confirmação mostra: "Presença confirmada, João Silva!"

### Teste 10.1: Evento SEM Reconhecimento Facial (✨ novo)
1. **Admin cria evento**:
   - Data: 19/04/2026
   - ☐ Exige reconhecimento facial (desmarcado)
   - Descrição: "Evento Grande - 200 alunos"
2. Admin imprime QR Code
3. **No dia 19/04**, aluno escaneia QR
4. **Formulário mostra**: Apenas CPF + Email (sem botão câmera/selfie)
5. Aluno preenche:
   - CPF: 123.456.789-00
   - Email: joao@email.com
6. Clica "Confirmar"
7. Sistema busca nome "João Silva"
8. **Aprovação instantânea** (status='aprovada', sem facial)
9. Mensagem: "Presença confirmada, João Silva!"
10. Nome aparece **verde no painel imediatamente**

### Teste 10.2: Evento COM Reconhecimento Facial (✨ novo)
1. **Admin cria evento**:
   - Data: 26/04/2026
   - ☑️ Exige reconhecimento facial (marcado)
   - Descrição: "Evento Regular - 50 alunos"
2. **No dia 26/04**, aluno escaneia QR
3. **Formulário mostra**: CPF + Email + **Botão "Tirar Selfie" (obrigatório)**
4. Aluno preenche CPF e email
5. **Tentar confirmar sem tirar selfie** → erro "Selfie obrigatória para este evento"
6. **Tira selfie** (câmera frontal)
7. Sistema compara faces:
   - Confiança >= 70%: Aprovação automática
   - Confiança < 70%: Status='pendente', aguarda admin
8. Se aprovado: "Presença confirmada, João Silva!"

### Teste 10.3: Diferentes Eventos no Mesmo Dia (✨ novo)
1. Criar 2 eventos para 19/04:
   - Evento A: COM facial (manhã)
   - Evento B: SEM facial (tarde)
2. Aluno escaneia QR do Evento A → exige selfie
3. Aluno escaneia QR do Evento B → não exige selfie
4. Ambos registram corretamente com configurações diferentes
```

---

### 10. Atualizar Versão no Rodapé

**PROCURAR POR:**
```markdown
**Versão**: 2.2
```

**SUBSTITUIR POR:**
```markdown
**Versão**: 2.3 (Configuração flexível por evento + formulário simplificado CPF/Email)  
**Última Atualização**: 17/04/2026

---

## 🎯 Mudanças da Versão 2.3

### ✨ Configuração Flexível por Evento
- Campo `requer_reconhecimento_facial` na tabela `eventos`
- Admin decide por evento: COM ou SEM facial
- Eventos grandes (200+ alunos): Sem facial, aprovação rápida
- Eventos regulares: Com facial, segurança máxima

### 📝 Formulário Simplificado
- **Antes**: CPF + Nome + Email (3 campos)
- **Agora**: CPF + Email (2 campos)
- Nome buscado automaticamente pelo CPF
- Validação: email deve corresponder ao cadastrado
- Experiência mais rápida para o usuário

### 🔒 Segurança Mantida
- CPF + Email = identificação forte
- Email deve ser o cadastrado (não pode usar qualquer email)
- Reconhecimento facial opcional por evento
- Log e auditoria completos
```

---

## ✅ Resumo das Mudanças v2.3

1. **Tabela eventos**: 2 novos campos (requer_reconhecimento_facial, descricao)
2. **Formulário**: Removido campo "nome" - busca automática pelo CPF
3. **Validação**: Email deve corresponder ao cadastrado
4. **Novo endpoint**: GET /api/eventos/:id/config
5. **Lógica condicional**: Selfie apenas se evento exigir
6. **Aprovação instantânea**: Eventos SEM facial aprovam direto
7. **3 novos testes**: Validação de email, evento COM/SEM facial, múltiplos eventos

## 🎯 Benefícios

- **Flexibilidade**: Admin escolhe por evento
- **Rapidez**: Formulário 2 campos em vez de 3
- **Escalabilidade**: Eventos grandes sem gargalo de facial
- **Segurança**: Email validado + facial opcional
- **UX**: Nome aparece automaticamente na confirmação
