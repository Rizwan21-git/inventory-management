import express from "express";

const inventoryRoutes = express.Router();

import { getAllProducts, deleteProduct, updateProduct, addProduct, updateStock, getLowStock } from "../controllers/inventory.controller.js";

// Route to get all products
inventoryRoutes.post("/", addProduct);
inventoryRoutes.get("/", getAllProducts);
inventoryRoutes.put("/:id", updateProduct);
inventoryRoutes.delete("/:id", deleteProduct);
inventoryRoutes.get("/lowStock", getLowStock)
inventoryRoutes.patch("/:id/stock", updateStock);

export default inventoryRoutes;