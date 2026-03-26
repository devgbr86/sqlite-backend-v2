import { findAll, findById, insertUser, deleteUser } from "../models/userModel.js";

export function getUsers(req, res) {
  try {
    res.json(findAll());
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}

export function getUser(req, res) {
  try {
    const user = findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
}

export function createUser(req, res) {
  try {
    const { name, email } = req.body;
    insertUser(name, email);
    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
}

export function removeUser(req, res) {
  try {
    const user = findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    deleteUser(req.params.id);
    res.json({ message: "Usuário removido" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover usuário" });
  }
}
