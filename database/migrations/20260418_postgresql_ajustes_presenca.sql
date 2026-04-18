-- Ajustes minimos de schema alinhados ao fluxo de presenca via QRCode.
-- Banco alvo: PostgreSQL

BEGIN;

ALTER TABLE alunos
  ADD COLUMN IF NOT EXISTS empresa VARCHAR(255);

ALTER TABLE eventos
  ADD COLUMN IF NOT EXISTS requer_reconhecimento_facial BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS descricao VARCHAR(255);

ALTER TABLE presencas
  ADD CONSTRAINT uk_presencas_aluno_evento UNIQUE (aluno_id, evento_id);

CREATE INDEX IF NOT EXISTS idx_presencas_evento_id ON presencas(evento_id);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno_id ON presencas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_alunos_empresa ON alunos(empresa);

COMMIT;
