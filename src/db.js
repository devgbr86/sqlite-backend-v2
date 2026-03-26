import initSqlJs from "sql.js";
import { readFileSync, writeFileSync, existsSync } from "fs";

const DB_PATH = "database.db";

let db;

export async function initDB() {
  const SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Habilita foreign keys
  db.run("PRAGMA foreign_keys = ON;");
}

export function save() {
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

export function run(sql, params = []) {
  db.run(sql, params);
  save();
}

export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}
