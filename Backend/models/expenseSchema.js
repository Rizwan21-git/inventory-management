import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    expenseName: { type: String, required: true },
    category: {
      type: String,
      enum: ["rent", "transport", "bills", "guests", "service", "purchasing"],
      required: true,
    },
    amount: { type: Number, required: true },
    proof: { type: String, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Expense = mongoose.model("expense", expenseSchema);
