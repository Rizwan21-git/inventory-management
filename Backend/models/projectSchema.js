import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    siteLocation: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    workerAssigned: { type: String, required: true },
    customerRequirement: { type: String, default: "" },
    customerLabourCost: { type: Number, default: 0 },
    workerPayment: { type: Number, default: 0 },
    profit: {type: Number, default: 0},
    status: {
      type: String,
      enum: ["completed", "in_progress"],
    },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Projects", projectSchema);
