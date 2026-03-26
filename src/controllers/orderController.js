import {
  findAllWithUsers,
  findByUserId,
  insertOrder,
  deleteOrder,
} from "../models/orderModel.js";
import { findById as findUserById } from "../models/userModel.js";

export function getOrders(req, res) {
  try {
    res.json(findAllWithUsers());
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
}

export function getOrdersByUser(req, res) {
  try {
    res.json(findByUserId(req.params.userId));
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedidos do usuário" });
  }
}

export function createOrder(req, res) {
  try {
    const { user_id, product, total } = req.body;
    const user = findUserById(user_id);
    if (!user) return res.status(400).json({ error: "Usuário não existe" });
    insertOrder(user_id, product, total);
    res.status(201).json({ message: "Pedido criado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar pedido" });
  }
}

export function removeOrder(req, res) {
  try {
    deleteOrder(req.params.id);
    res.json({ message: "Pedido removido" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover pedido" });
  }
}
