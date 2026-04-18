const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, '..', '..', process.env.DB_PATH || './src/database/automacao.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSQL);

function montarResultadoExec(info) {
  return [{
    insertId: Number(info.lastInsertRowid || 0),
    affectedRows: Number(info.changes || 0)
  }];
}

async function query(sql, params = []) {
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

module.exports = {
  query
};
