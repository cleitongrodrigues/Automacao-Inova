-- Ajustes minimos de schema alinhados ao fluxo de presenca via QRCode.
-- Banco alvo: SQLite

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

ALTER TABLE alunos ADD COLUMN empresa TEXT;
ALTER TABLE eventos ADD COLUMN requer_reconhecimento_facial INTEGER NOT NULL DEFAULT 1;
ALTER TABLE eventos ADD COLUMN descricao TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uk_presencas_aluno_evento
ON presencas(aluno_id, evento_id);

CREATE INDEX IF NOT EXISTS idx_presencas_evento_id ON presencas(evento_id);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno_id ON presencas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_alunos_empresa ON alunos(empresa);

COMMIT;
PRAGMA foreign_keys = ON;
