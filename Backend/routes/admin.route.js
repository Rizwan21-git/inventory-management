import express from "express";
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  // verifyAdminCredentials,
} from "../controllers/admin.controller.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const adminRoutes = express.Router();

// Admin CRUD (protected - admin only)
adminRoutes.get("/", authMiddleware, isAdmin, getAllAdmins);
adminRoutes.post("/", authMiddleware, isAdmin, createAdmin);
adminRoutes.get("/:id", authMiddleware, isAdmin, getAdminById);
adminRoutes.put("/:id", authMiddleware, isAdmin, updateAdmin);
adminRoutes.delete("/:id", authMiddleware, isAdmin, deleteAdmin);

// Verify credentials (public)
// adminRoutes.post("/verify", verifyAdminCredentials);

export default adminRoutes;
