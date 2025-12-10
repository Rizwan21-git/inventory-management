import asyncHandler from "express-async-handler";
import { Project } from "../models/projectSchema.js";
import Admin from "../models/adminSchema.js";
import Shop from "../models/shopSchema.js";

const getCreatorName = async (req) => {
  try {
    const userId = req.user?.userId;
    const userType = req.user?.userType;
    if (!userId || !userType) return "";
    if (userType === "admin") {
      const admin = await Admin.findById(userId);
      return admin ? admin.name : "";
    }
    if (userType === "shop") {
      const shop = await Shop.findById(userId);
      return shop ? shop.name : "";
    }
    return "";
  } catch (error) {
    return "";
  }
};

export const getAllProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find();
  res.json(projects);
});

export const addProject = asyncHandler(async (req, res, next) => {
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
  // Validate required fields
  if (!projectName || !siteLocation || !customerName || !customerPhone || !workerAssigned) {
    return res.status(400).json({ message: "projectName, siteLocation, customerName, customerPhone and workerAssigned are required" });
  }
  const creatorName = (await getCreatorName(req)) || req.body.createdBy || "";
  if (!creatorName) {
    return res.status(400).json({ message: "Unable to determine creator name" });
  }
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
    createdBy: creatorName,
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
  const found = await Project.findById(id);
  found && await found.updateOne(data);
  const updatedProject = await Project.findById(id);
  if (!updatedProject) {
    res.status(404);
    throw new console.error("Project not found");
  }
  res.json(updatedProject);
})
