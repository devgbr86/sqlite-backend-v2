import { run, all, get } from "../db.js";

export function createUserTable() {
  run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function findAll() {
  return all("SELECT * FROM users ORDER BY id DESC");
}

export function findById(id) {
  return get("SELECT * FROM users WHERE id = ?", [id]);
}

export function insertUser(name, email) {
  run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email]);
}

export function deleteUser(id) {
  run("DELETE FROM users WHERE id = ?", [id]);
}
