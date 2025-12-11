import { errorHandler } from "./middleware/errorMiddleware.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Import routes
import inventoryRoutes from "./routes/inventory.route.js";
import invoiceRoutes from "./routes/invoice.route.js";
import projectRoutes from "./routes/project.route.js";
import expenseRoutes from "./routes/expense.route.js";
import shopRoutes from "./routes/shop.route.js";
import adminRoutes from "./routes/admin.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import authRoutes from "./routes/auth.route.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));

// Parse JSON data
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);


// Use error handling middleware
app.use(errorHandler);

// Define the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/inventory";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
