import asyncHandler from "express-async-handler";
import { Product } from "../models/productSchema.js";

// Route to get all products
export const getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({});
  res.json(products);
});

export const addProduct = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const {
    name,
    category,
    sizes,
    quantity,
    buyingPrice,
    sellingPrice,
    profitMargin,
    condition,
    image,
  } = req.body;
  const newProduct = new Product({
    name,
    category,
    sizes,
    quantity,
    buyingPrice,
    sellingPrice,
    profitMargin,
    condition,
    image,
  });
  const savedProduct = await newProduct.save();
  res.status(201).json(savedProduct);
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updatedData = req.body;
  const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
    new: true,
  });
  if (!updatedProduct) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(updatedProduct);
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(id);
  if (!deletedProduct) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ id });
});

export const updateStock = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const quantity = req.body;
  const updatedProduct = await Product.findByIdAndUpdate(id, quantity, {
    new: true,
  });
  if (!updatedProduct) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(updatedProduct);
});
