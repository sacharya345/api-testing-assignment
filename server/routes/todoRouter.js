import express from "express";
import jwt from "jsonwebtoken";
import * as todoRepo from "../repository/todoRepository.js";

const router = express.Router();

// Auth middleware: expects token in Authorization header (supports "Bearer <token>" too)
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.sendStatus(401);
  }
};

// GET /  -> list all tasks (PUBLIC)
router.get("/", (req, res) => {
  res.status(200).json(todoRepo.getAll());
});

// POST /create -> create task (PROTECTED)
router.post("/create", authMiddleware, (req, res) => {
  const { description } = req.body;

  // Validation: must exist and be >= 3 chars
  if (!description || typeof description !== "string" || description.length < 3) {
    return res.status(400).json({ error: "Description must be at least 3 characters" });
  }

  const created = todoRepo.create(description);
  return res.status(201).json(created);
});

// DELETE /:id -> delete task by id (PROTECTED)
router.delete("/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) return res.sendStatus(400);

  const removed = todoRepo.remove(id);
  if (!removed) return res.sendStatus(404);

  return res.sendStatus(204);
});

export default router;