import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

const expenseRoutes = express.Router();

import {
  getAllExpense,
  deleteExpense,
  addExpense,
} from "../controllers/expense.controller.js";

// Routes
expenseRoutes.post("/", authMiddleware, addExpense);
expenseRoutes.get("/", getAllExpense);
expenseRoutes.delete("/:id", authMiddleware, deleteExpense);

export default expenseRoutes;