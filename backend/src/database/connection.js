// Arquivo responsável por abrir conexão com SQlite, permitir executar comando SQL e ser usado pelo Controller

//Lê arquivo do computador (schema.sql)
const fs = require('fs');
//Montar caminhos de arquivos corretamente 
const path = require('path');
//better-sqlite3 -> biblioteca para acessar banco SQLite
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, '..', '..', process.env.DB_PATH || './src/database/automacao.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

//Abre o arquivo .db
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

//Quando o backend sobe, ele lê o schema.sql e cria tabelas automaticmanete 
const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSQL);

//Padroniza o retorno de INSERT, UPDATE E DELETE 
function montarResultadoExec(info) {
  return [{
    insertId: Number(info.lastInsertRowid || 0),
    affectedRows: Number(info.changes || 0)
  }];
}

//Cria função query, essa função é a interface que os controllers usam para conversar com o banco 
async function query(sql, params = []) {
  //Limpa espaços e transforma em minúsuclo
  const comando = sql.trim().toLowerCase();

  if (comando.startsWith('select')) {
    const stmt = db.prepare(sql);
    const rows = stmt.all(params);
    return [rows];
  }

  if (comando.startsWith('insert')) {
    const stmt = db.prepare(sql);
    const info = stmt.run(params);
    return montarResultadoExec(info);
  }

  if (comando.startsWith('update') || comando.startsWith('delete')) {
    const stmt = db.prepare(sql);
    const info = stmt.run(params);
    return montarResultadoExec(info);
  }

  db.exec(sql);
  return [{ affectedRows: 0 }];
}

//Exporta 
module.exports = {
  query
};
