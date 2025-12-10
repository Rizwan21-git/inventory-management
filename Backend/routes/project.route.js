import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

const projectRoutes = express.Router();

import {
  getAllProjects,
  deleteProject,
  updateStatus,
  addProject,
} from "../controllers/project.controller.js";

// Route to get all projects
projectRoutes.post("/", authMiddleware, addProject);
projectRoutes.get("/", getAllProjects);
projectRoutes.patch("/:id", authMiddleware, updateStatus);
projectRoutes.delete("/:id", authMiddleware, deleteProject);

export default projectRoutes;