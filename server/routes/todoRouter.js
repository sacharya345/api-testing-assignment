import express from "express";
import { create, getAll, remove } from "../repository/todoRepository.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Apply authentication to all routes
router.use(authenticate);

router.get("/", (req, res) => {
  const tasks = getAll();
  res.json(tasks);
});

router.post("/create", (req, res) => {
  const { task } = req.body;

  if (!task || !task.description) {
    return res.status(400).json({ error: "Missing task description" });
  }

  if (task.description.length < 3) {
    return res.status(400).json({ error: "Description too short" });
  }

  const newTask = create(task.description);
  res.status(201).json(newTask);
});

router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const result = remove(id);

  if (result) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

export default router;