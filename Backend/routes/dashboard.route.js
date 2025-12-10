import express from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getAvailableYears,
} from "../controllers/dashboard.controller.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/stats", authMiddleware, isAdmin, getDashboardStats);
dashboardRoutes.get("/years", getAvailableYears);

export default dashboardRoutes;
