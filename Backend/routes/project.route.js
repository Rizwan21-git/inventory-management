import express from "express";

const projectRoutes = express.Router();

import {
  getAllProjects,
  deleteProject,
  updateStatus,
  addProject,
} from "../controllers/project.controller.js";

// Route to get all products
projectRoutes.post("/", addProject);
projectRoutes.get("/", getAllProjects);
projectRoutes.patch("/:id", updateStatus);
projectRoutes.delete("/:id", deleteProject);

export default projectRoutes;