// import asyncHandler from "express-async-handler";
// import { Expense } from "../models/expenseSchema.js";

// export const getAllExpense = asyncHandler(async (req, res, next) => {
//   const expenses = await Expense.find();
//   res.json(expenses);
// });

// export const addExpense = asyncHandler(async (req, res, next) => {
//   console.log(req.body);
//   const { expenseName, category, amount, proof, notes } = req.body;
//   const newExpense = new Expense({
//     expenseName,
//     category,
//     amount,
//     proof,
//     notes,
//   });
//   const savedExpense = await newExpense.save();
//   res.status(201).json(savedExpense);
// });

// export const deleteExpense = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const deletedExpense = await Expense.findByIdAndDelete(id);
//   if (!deletedExpense) {
//     res.status(404);
//     throw new Error("Expense not found");
//   }
//   res.json(deletedExpense);
// });








import { Expense } from "../models/expenseSchema.js";

// Get all expenses
export const getAllExpense = async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new expense
export const addExpense = async (req, res) => {
  try {
    const { expenseName, category, amount, proof, notes } = req.body;

    if (!expenseName || !category || !amount) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Expense name, category, and amount are required",
        });
    }

    const newExpense = new Expense({
      expenseName,
      category,
      amount,
      proof,
      notes,
    });
    const savedExpense = await newExpense.save();

    res.status(201).json({ success: true, data: savedExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({ success: true, data: deletedExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
