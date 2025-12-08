// routes/shopRoutes.js - All API Routes
import express from "express";
import {
  // Shop controllers
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  // updateShopPassword,
  deleteShop,
  verifyShopCredentials,
  // Worker controllers
  createWorker,
  getAllWorkers,
  getWorkerById,
  updateWorker,
  updateWorkerPermissions,
  deleteWorker,
  getWorkersByShop,
  // getPermissionsSummary,
  // getDashboardStatistics,
} from "../controllers/shop.controller.js";
// import { protect } from "../middleware/authMiddleware.js";


const shopRoutes = express.Router();
// ========== SHOP ROUTES ==========

// Statistics

// shopRoutes.get("/statistics", protect, getDashboardStatistics);
// Shop CRUD
shopRoutes.get("/", /*protect,*/ getAllShops);
shopRoutes.post("/", /*protect,*/ createShop);
shopRoutes.get("/:id", /*protect,*/ getShopById);
shopRoutes.put("/:id", /*protect,*/ updateShop);
// shopRoutes.put("/:id/password", /*protect,*/ updateShopPassword);
shopRoutes.delete("/:id", /*protect,*/ deleteShop); 

// Verify credentials

shopRoutes.post("/verify", verifyShopCredentials);
// ========== WORKER ROUTES ==========

// Get workers by shop
shopRoutes.get("/:shopId/workers", /*protect,*/ getWorkersByShop);

// Worker CRUD
shopRoutes.post("/workers", /*protect,*/ createWorker);
shopRoutes.get("/workers", /*protect,*/ getAllWorkers);
shopRoutes.get("/workers/:id", /*protect,*/ getWorkerById);
shopRoutes.put("/workers/:id", /*protect,*/ updateWorker);
shopRoutes.delete("/workers/:id", /*protect,*/ deleteWorker);

// Worker permissions
shopRoutes.put(
  "/workers/:id/permissions",
  /*protect,*/ updateWorkerPermissions
);
// shopRoutes.get(
//   "/workers/:id/permissions-summary",
//   /*protect,*/ getPermissionsSummary
// );

export default shopRoutes;
