// Error handling middleware
import { errorHandler } from "./middleware/errorMiddleware.js";
// Backend/app.js
import express from "express";
// Import CORS package
import cors from "cors";
// Import and configure dotenv to manage environment variables
import dotenv from "dotenv";
dotenv.config();

// Routes
import authRoute from "./routes/auth.route.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
const app = express();

// Parse JSON data
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  //   credentials: true,
};
// Enable CORS with the specified options
app.use(cors(corsOptions));

// Basic route to test server
app.get("/", (req, res) => {
  res.send("Inventory Management Backend is running");
});

app.use("/api/auth", authRoute);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/reports", financeRoutes); // Using financeRoutes for reports as a placeholder

app.use(errorHandler);
// Define the port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
