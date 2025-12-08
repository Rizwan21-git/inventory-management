import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    workerCount: {
      type: Number,
      default: 0,
      min: [0, "Worker count cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// shopSchema.index({ name: 1 });
// shopSchema.index({ username: 1 });
// shopSchema.index({ email: 1 });

export default mongoose.model("Shop", shopSchema);
