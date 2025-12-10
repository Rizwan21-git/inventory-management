import mongoose from "mongoose";
import { invoiceItemSchema } from "./invoiceItemSchema.js";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceType: {
      type: String,
      enum: ["selling", "buying", "dropshipping", "quotation"],
      required: true,
    },
    name: { type: String, required: true }, 
    address: { type: String },
    phoneNumber: { type: String },
    items: [invoiceItemSchema],
    taxRate: { type: Number, default: 0 },
    discountRate: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    profit: {type: Number, default: 0},
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", null],
      default: "pending",
    },
    bankUsed: { type: String, default: "" },
    paymentProof: { type: String, default: null }, 
    supplierName: { type: String, default: "" },
    shippingCost: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
