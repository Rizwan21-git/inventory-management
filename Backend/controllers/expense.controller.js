import asyncHandler from "express-async-handler";
import { Expense } from "../models/expenseSchema.js";

export const getAllExpense = asyncHandler(async (req, res, next) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

export const addExpense = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const { expenseName, category, amount, proof, notes } = req.body;
  const newExpense = new Expense({
    expenseName,
    category,
    amount,
    proof,
    notes,
  });
  const savedExpense = await newExpense.save();
  res.status(201).json(savedExpense);
});

export const deleteExpense = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedExpense = await Expense.findByIdAndDelete(id);
  if (!deletedExpense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  res.json(deletedExpense);
});
