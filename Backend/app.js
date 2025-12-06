import { errorHandler } from "./middleware/errorMiddleware.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Import routes
import inventoryRoutes from "./routes/inventory.route.js";
import invoiceRoutes from "./routes/invoice.route.js";


const app = express();
app.use(cors());

// Parse JSON data
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use("/inventory", inventoryRoutes);
app.use("/invoices", invoiceRoutes);

// CORS configuration
// const corsOptions = {
//   origin: "http://localhost:3000/",
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   credentials: true,
// };
// Enable CORS with the specified options

// Use error handling middleware
app.use(errorHandler);

// Define the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

mongoose
  .connect("mongodb://127.0.0.1:27017/inventory")
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
