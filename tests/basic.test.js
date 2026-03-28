import initSqlJs from 'sql.js';
import { strict as assert } from 'assert';

const SQL = await initSqlJs();
const db = new SQL.Database();

db.run(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  );
  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product TEXT NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Insere usuário
db.run(`INSERT INTO users (name, email) VALUES ('João', 'joao@test.com')`);
const user = db.exec(`SELECT * FROM users`)[0];
assert.equal(user.values[0][1], 'João', 'Usuário inserido');

// Insere pedido
db.run(`INSERT INTO orders (user_id, product, total) VALUES (1, 'Frango', 29.90)`);

// Testa JOIN
const result = db.exec(`
  SELECT orders.product, users.name
  FROM orders JOIN users ON users.id = orders.user_id
`)[0];
assert.equal(result.values[0][0], 'Frango', 'Produto no JOIN');
assert.equal(result.values[0][1], 'João', 'Nome do usuário no JOIN');

console.log('Todos os testes passaram.');