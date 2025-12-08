import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Worker name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["Senior", "Junior", "Manager", "Supervisor", "Trainee"],
      default: "Junior",
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
    },
    joinDate: {
      type: Date,
      required: [true, "Join date is required"],
      default: Date.now,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: [true, "Shop ID is required"],
    },
    permissions: {
      dashboard: {
        type: Boolean,
        default: false,
      },
      inventory: {
        type: Boolean,
        default: false,
      },
      invoices: {
        type: Boolean,
        default: false,
      },
      finance: {
        type: Boolean,
        default: false,
      },
      quotation: {
        type: Boolean,
        default: false,
      },
      projects: {
        type: Boolean,
        default: false,
      },
      dropshipping: {
        type: Boolean,
        default: false,
      },
      investment: {
        type: Boolean,
        default: false,
      },
      expenses: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to populate shop info when queried
// workerSchema.pre(/^find/, function (next) {
//   if (this.options._recursed) {
//     return next();
//   }
//   this.populate({
//     path: "shopId",
//     select: "name location",
//     options: { _recursed: true },
//   });
//   next();
// });

export default mongoose.model("Worker", workerSchema);
