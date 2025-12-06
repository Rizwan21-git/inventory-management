import mongoose from "mongoose";

export const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: { type: String, required: true },
  size: {
    width: { type: Number },
    length: { type: Number },
  },
  sizeIdx: {type: Number},
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
  buyingPrice: { type: Number },
});
