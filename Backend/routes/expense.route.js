import express from "express";

const expenseRoutes = express.Router();

import {
  getAllExpense,
  deleteExpense,
  addExpense,
} from "../controllers/expense.controller.js";

// Route to get all products
expenseRoutes.post("/", addExpense);
expenseRoutes.get("/", getAllExpense);
expenseRoutes.delete("/:id", deleteExpense);

export default expenseRoutes;