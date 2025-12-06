import asyncHandler from "express-async-handler";
import { Project } from "../models/projectSchema.js";

export const getAllProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find();
  res.json(projects);
});

export const addProject = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const {
    projectName,
    siteLocation,
    customerName,
    customerPhone,
    workerAssigned,
    customerRequirement,
    customerLabourCost,
    workerPayment,
    profit,
    status,
  } = req.body;
  const newProject = new Project({
    projectName,
    siteLocation,
    customerName,
    customerPhone,
    workerAssigned,
    customerRequirement,
    customerLabourCost,
    workerPayment,
    profit,
    status,
  });
  const savedProject = await newProject.save();
  res.status(201).json(savedProject);
});

export const deleteProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedProject = await Project.findByIdAndDelete(id);
  if (!deletedProject) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json(deletedProject);
});

export const updateStatus = asyncHandler(async(req, res, next)=>{
  const {id} = req.params;
  const data = req.body;
  console.log(data);
  const updatedProject = await Project.findByIdAndUpdate(id, data);
  if (!updatedProject) {
    res.status(404);
    throw new console.error("Project not found");
  }
  // console.log(updatedProject);
  res.json(updatedProject);
})
