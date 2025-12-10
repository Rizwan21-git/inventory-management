import express from "express";
import { login, logout, getCurrentUser } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);

export default router;
