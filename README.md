# sqlite-backend

Backend com Node.js, Express e SQLite via sql.js.  
Arquitetura em camadas: routes → controllers → models → db.

---

## Por que sql.js e nao better-sqlite3

O `better-sqlite3` compila codigo nativo em C++ durante o `npm install`.
No Windows isso exige Python e Visual Studio Build Tools instalados, o que
frequentemente causa erro no `node-gyp`.

O `sql.js` e uma versao do SQLite compilada para WebAssembly (WASM).
E 100% JavaScript, nao compila nada, funciona em qualquer sistema sem
dependencias extras.

A diferenca pratica: o `sql.js` carrega o banco de forma assincrona
(precisa de `await` na inicializacao), enquanto o `better-sqlite3` e
sincrono. O restante da API e equivalente.

---

## Estrutura de pastas

```
project/
├── package.json
├── database.db               <- criado automaticamente na primeira execucao
├── public/
│   └── index.html            <- frontend (servido pelo Express)
└── src/
    ├── server.js             <- entry point, inicializa banco e sobe servidor
    ├── db.js                 <- conexao com SQLite, funcoes utilitarias
    ├── middlewares/
    │   └── validate.js       <- validacao de campos obrigatorios
    ├── models/
    │   ├── userModel.js      <- queries SQL da tabela users
    │   └── orderModel.js     <- queries SQL da tabela orders (inclui JOIN)
    ├── controllers/
    │   ├── userController.js <- logica HTTP para usuarios
    │   └── orderController.js <- logica HTTP para pedidos
    └── routes/
        ├── users.js          <- define as rotas de /users
        └── orders.js         <- define as rotas de /orders
```

---

## O fluxo de uma requisicao

Quando o frontend faz `POST /users`, o caminho percorrido e:

```
request HTTP (frontend)
    |
routes/users.js         -> mapeia POST / para createUser
    |
middlewares/validate.js -> verifica se name e email estao presentes
    |
controllers/userController.js -> trata req/res, chama o model
    |
models/userModel.js     -> executa o SQL (INSERT INTO users ...)
    |
db.js                   -> roda a query no banco e salva o arquivo .db
    |
database.db             -> dados persistidos em disco
```

Cada camada tem uma responsabilidade unica. A rota nao sabe de SQL.
O model nao sabe de HTTP. O controller une os dois.

---

## Instalacao e execucao

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

O arquivo `database.db` e criado automaticamente na raiz do projeto
na primeira vez que o servidor sobe. As tabelas tambem sao criadas
automaticamente via `CREATE TABLE IF NOT EXISTS`.

---

## Como o banco e inicializado (db.js)

O `sql.js` precisa ser inicializado de forma assincrona antes de qualquer
operacao. Por isso o `server.js` usa `initDB().then(...)` para so subir
o servidor depois que o banco estiver pronto.

```js
// server.js
initDB().then(() => {
  createUserTable();
  createOrderTable();
  app.listen(3000);
});
```

O `db.js` exporta tres funcoes utilitarias que encapsulam a API do sql.js:

- `run(sql, params)` — executa INSERT, UPDATE, DELETE e salva em disco
- `all(sql, params)` — retorna todas as linhas de um SELECT
- `get(sql, params)`  — retorna a primeira linha de um SELECT

Essas funcoes sao usadas diretamente nos models. Nenhum arquivo fora
do `db.js` importa o sql.js diretamente.

---

## Tabelas

### users

```sql
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### orders

```sql
CREATE TABLE IF NOT EXISTS orders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  product    TEXT    NOT NULL,
  total      REAL    NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

A `FOREIGN KEY` garante que um pedido so pode existir vinculado a um
usuario valido. O `ON DELETE CASCADE` significa que se um usuario for
deletado, todos os seus pedidos sao deletados junto automaticamente.

---

## O JOIN

A query principal do `orderModel.js` une as duas tabelas:

```sql
SELECT
  orders.id,
  orders.product,
  orders.total,
  orders.created_at,
  users.name  AS user_name,
  users.email AS user_email
FROM orders
JOIN users ON users.id = orders.user_id
ORDER BY orders.id DESC;
```

Sem o JOIN, `GET /orders` retornaria apenas o `user_id` (um numero).
Com o JOIN, a resposta inclui o nome e email do usuario correspondente,
sem precisar fazer duas requisicoes separadas.

---

## Endpoints

### /users

| Metodo | Rota        | Body              | Descricao              |
|--------|-------------|-------------------|------------------------|
| GET    | /users      | -                 | lista todos usuarios   |
| GET    | /users/:id  | -                 | busca usuario por id   |
| POST   | /users      | { name, email }   | cria usuario           |
| DELETE | /users/:id  | -                 | remove usuario         |

### /orders

| Metodo | Rota                  | Body                        | Descricao                    |
|--------|-----------------------|-----------------------------|------------------------------|
| GET    | /orders               | -                           | lista pedidos com JOIN       |
| GET    | /orders/user/:userId  | -                           | pedidos de um usuario        |
| POST   | /orders               | { user_id, product, total } | cria pedido                  |
| DELETE | /orders/:id           | -                           | remove pedido                |

---

## Validacao

O middleware `validate.js` e reutilizavel. Recebe um array de campos
obrigatorios e retorna 400 com mensagem clara se algum estiver faltando.

```js
// uso na rota
router.post("/", validate(["name", "email"]), createUser);
```

Se o body chegar sem `email`, a resposta sera:

```json
{ "error": "Campos obrigatorios faltando: email" }
```

O controller nunca precisa checar isso manualmente.

---

## Tratamento de erros

Os controllers capturam erros especificos do banco e retornam mensagens
adequadas ao inves de expor o erro interno:

- email duplicado → 409 `Email ja cadastrado`
- usuario nao encontrado → 404 `Usuario nao encontrado`
- usuario invalido no pedido → 400 `Usuario nao existe`
- erro generico → 500 `Erro interno`

---

## Frontend

O `index.html` dentro de `public/` e servido estaticamente pelo Express
via `app.use(express.static("public"))`.

Tem tres tabs:

- `users` — formulario para criar usuarios e listar via SELECT
- `orders` — formulario para criar pedidos vinculados a um usuario
- `orders + join` — exibe o resultado do JOIN entre as duas tabelas

Cada botao da interface corresponde a uma operacao SQL real executando
no backend. Os nomes `INSERT`, `SELECT *` e `RUN query` foram escolhidos
intencionalmente para associar a acao visual ao comando SQL equivalente.

---

## Dependencias

| Pacote   | Versao  | Funcao                              |
|----------|---------|-------------------------------------|
| express  | ^4.18.2 | servidor HTTP e roteamento          |
| sql.js   | ^1.10.3 | SQLite compilado em WebAssembly     |

Nenhuma dependencia nativa. Funciona no Windows, Mac e Linux sem
configuracao adicional.