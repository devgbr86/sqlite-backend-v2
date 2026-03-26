import express from "express";
import { initDB } from "./db.js";
import { createUserTable } from "./models/userModel.js";
import { createOrderTable } from "./models/orderModel.js";
import userRoutes from "./routes/users.js";
import orderRoutes from "./routes/orders.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Inicializa banco antes de subir o servidor
initDB().then(() => {
  createUserTable();
  createOrderTable();

  app.listen(3000, () => {
    console.log("\n🚀 Server rodando em http://localhost:3000");
    console.log("📦 Frontend em http://localhost:3000/index.html\n");
  });
});
