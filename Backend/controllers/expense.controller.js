import { Expense } from "../models/expenseSchema.js";
import Admin from "../models/adminSchema.js";
import Shop from "../models/shopSchema.js";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

const getCreatorName = async (req) => {
  try {
    const userId = req.user?.userId;
    const userType = req.user?.userType;
    if (!userId || !userType) return "";
    if (userType === "admin") {
      const admin = await Admin.findById(userId);
      return admin ? admin.name : "";
    }
    if (userType === "shop") {
      const shop = await Shop.findById(userId);
      return shop ? shop.name : "";
    }
    return "";
  } catch (error) {
    return "";
  }
};

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

    // Validate proof size when provided (base64)
    if (proof) {
      try {
        const base64 = (String(proof).split(",")[1] || "");
        const approxSize = Math.ceil((base64.length * 3) / 4);
        if (approxSize > MAX_FILE_SIZE) {
          return res.status(400).json({ success: false, message: "Proof file exceeds maximum size of 1 MB" });
        }
      } catch (err) {}
    }

    const creatorName = (await getCreatorName(req)) || req.body.createdBy || "";
    if (!creatorName) {
      return res.status(400).json({ success: false, message: "Unable to determine creator name" });
    }

    const newExpense = new Expense({
      expenseName,
      category,
      amount,
      proof,
      notes,
      createdBy: creatorName,
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
