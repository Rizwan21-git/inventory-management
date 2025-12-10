import express from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getAvailableYears,
  getRecentActivity,
} from "../controllers/dashboard.controller.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/stats", authMiddleware, isAdmin, getDashboardStats);
dashboardRoutes.get("/years", getAvailableYears);
dashboardRoutes.get("/activity",authMiddleware, isAdmin ,getRecentActivity);

export default dashboardRoutes;
