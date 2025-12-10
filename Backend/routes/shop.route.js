// routes/shopRoutes.js - All API Routes
import express from "express";
import {
  // Shop controllers
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
  // verifyShopCredentials,
  // Worker controllers
  createWorker,
  getAllWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getWorkersByShop,
} from "../controllers/shop.controller.js";
import { authMiddleware, isAdmin} from "../middleware/authMiddleware.js";

const shopRoutes = express.Router();
// ========== SHOP ROUTES ==========

// Shop CRUD (admin only)
shopRoutes.get("/", authMiddleware, isAdmin, getAllShops);
shopRoutes.post("/", authMiddleware, isAdmin, createShop);
shopRoutes.get("/:id", authMiddleware, getShopById);
shopRoutes.put("/:id", authMiddleware, isAdmin, updateShop);
shopRoutes.delete("/:id", authMiddleware, isAdmin, deleteShop);

// Verify credentials (public)
// shopRoutes.post("/verify", verifyShopCredentials);

// ========== WORKER ROUTES ==========

// Get workers by shop (admin or shop user)
shopRoutes.get("/:shopId/workers", authMiddleware, getWorkersByShop);

// Worker CRUD (admin or shop user)
shopRoutes.post("/workers", authMiddleware, isAdmin, createWorker);
shopRoutes.get("/workers", authMiddleware, isAdmin, getAllWorkers);
shopRoutes.get("/workers/:id", authMiddleware, isAdmin, getWorkerById);
shopRoutes.put("/workers/:id", authMiddleware, isAdmin, updateWorker);
shopRoutes.delete("/workers/:id", authMiddleware, isAdmin, deleteWorker);
shopRoutes.get("/workers/:id", authMiddleware, isAdmin, getWorkerById);
shopRoutes.put("/workers/:id", authMiddleware, isAdmin, updateWorker);
shopRoutes.delete("/workers/:id", authMiddleware, isAdmin, deleteWorker);

export default shopRoutes;
