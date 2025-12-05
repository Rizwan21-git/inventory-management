import express from "express";
const inventoryRouter = express.Router();

import { getAllProducts, deleteProduct, updateProduct, addProduct, updatedData } from "../controllers/inventory.controller.js";

// Route to get all products
inventoryRouter.get("/inventory", getAllProducts);
inventoryRouter.post("/inventory", addProduct);
inventoryRouter.put("/inventory/:id", updateProduct);
inventoryRouter.delete("/inventory/:id", deleteProduct);
inventoryRouter.patch("/inventory/:id", updatedData);

export default inventoryRouter;
  