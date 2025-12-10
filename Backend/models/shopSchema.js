import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    // Fixed permissions for every shop
    permissions: {
      inventory: {
        type: Boolean,
        default: true,
      },
      invoices: {
        type: Boolean,
        default: true,
      },
      projects: {
        type: Boolean,
        default: true,
      },
      quotation: {
        type: Boolean,
        default: true,
      },
      expenses: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);
// Hash password only if modified
shopSchema.pre("save", async function () {
  // If password not changed, skip hashing
  if (!this.isModified("password")) return;

  // If password is empty or invalid, skip hashing
  if (!this.password || typeof this.password !== "string") return;

  // If already hashed, skip
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method for login
shopSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Shop", shopSchema);
