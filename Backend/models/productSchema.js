import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["doors", "home_interior"],
      required: true,
    },
    sizes: [
      {
        width: { type: Number, required: true },
        length: { type: Number, required: true },
      },
    ],
    quantity: { type: Number, required: true },
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    profitMargin: {type: Number, required: true},
    condition: {
      type: String,
      enum: ["new", "used", "refurbished"],
      required: true,
    },
    image: { type: String, required: false },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
