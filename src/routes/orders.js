import express from "express";
import {
  getOrders,
  getOrdersByUser,
  createOrder,
  removeOrder,
} from "../controllers/orderController.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/user/:userId", getOrdersByUser);
router.post("/", validate(["user_id", "product", "total"]), createOrder);
router.delete("/:id", removeOrder);

export default router;
