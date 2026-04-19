CREATE TABLE IF NOT EXISTS presencas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER NOT NULL,
  evento_id INTEGER NOT NULL,
  data_hora_registro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'aprovada',
  foto_selfie TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (aluno_id) REFERENCES alunos(id),
  FOREIGN KEY (evento_id) REFERENCES eventos(id),
  UNIQUE (aluno_id, evento_id)
); -- ← AQUI ESTAVA FALTANDO

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

INSERT OR IGNORE INTO perfil (id, nome, descricao) VALUES
(1, 'operador', 'Perfil operacional'),
(2, 'admin', 'Administrador do sistema'),
(3, 'super_admin', 'Acesso total');