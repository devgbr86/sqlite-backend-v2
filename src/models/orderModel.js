import { run, all } from "../db.js";

export function createOrderTable() {
  run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product TEXT NOT NULL,
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

export function findAllWithUsers() {
  return all(`
    SELECT
      orders.id,
      orders.user_id,
      orders.product,
      orders.total,
      orders.created_at,
      users.name  AS user_name,
      users.email AS user_email
    FROM orders
    JOIN users ON users.id = orders.user_id
    ORDER BY orders.id DESC
  `);
}

export function findByUserId(userId) {
  return all("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [userId]);
}

export function insertOrder(userId, product, total) {
  run("INSERT INTO orders (user_id, product, total) VALUES (?, ?, ?)", [userId, product, total]);
}

export function deleteOrder(id) {
  run("DELETE FROM orders WHERE id = ?", [id]);
}
