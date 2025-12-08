import { Product } from "../models/productSchema.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get products with low stock (quantity <= 10)
export const getLowStock = async (req, res) => {
  try {
    const lowStockItems = await Product.find(
      { quantity: { $lte: 10 } },
      { name: 1, quantity: 1, category: 1, _id: 0 }
    );
    res.status(200).json({ success: true, data: lowStockItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      sizes,
      quantity,
      buyingPrice,
      sellingPrice,
      profitMargin,
      condition,
    } = req.body;

    if (!name || !category || !quantity || !sellingPrice) {
      return res.status(400).json({
        success: false,
        message: "Name, category, quantity, and sellingPrice are required",
      });
    }

    const newProduct = new Product({
      name,
      category,
      sizes,
      quantity,
      buyingPrice,
      sellingPrice,
      profitMargin,
      condition,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product details
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Filter out undefined or empty fields
    const updatedData = Object.fromEntries(
      Object.entries(req.body).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update stock quantity only
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity is required" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
