import express from "express";
import { getUsers, getUser, createUser, removeUser } from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", validate(["name", "email"]), createUser);
router.delete("/:id", removeUser);

export default router;
