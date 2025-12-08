import express from "express";
import {
  getDashboardStats,
  getAvailableYears,
  getRecentActivity,
} from "../controllers/dashboard.controller.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/stats", getDashboardStats);
dashboardRoutes.get("/years", getAvailableYears);
dashboardRoutes.get("/activity", getRecentActivity);

export default dashboardRoutes;
