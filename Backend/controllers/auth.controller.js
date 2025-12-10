import Admin from "../models/adminSchema.js";
import Shop from "../models/shopSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secreteKey123";
const JWT_EXPIRE = "7d";

// Generate JWT token
const generateToken = (userId, userType) => {
  return jwt.sign({ userId, userType }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// ========== LOGIN ==========
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Try to find admin first
    const admin = await Admin.findOne({ username });
    if (admin) {
      // Verify admin password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate token
      const token = generateToken(admin._id, "admin");

      const adminData = admin.toObject();
      delete adminData.password;

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          id: admin._id,
          name: admin.name,
          username: admin.username,
          email: admin.email,
          type: "admin",
          role: admin.role,
        },
      });
    }

    // Try to find shop
    const shop = await Shop.findOne({ username });
    if (shop) {
      // Verify shop password
      const isPasswordValid = await bcrypt.compare(password, shop.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate token
      const token = generateToken(shop._id, "shop");

      return res.status(200).json({
        success: true,
        message: "Shop login successful",
        token,
        user: {
          id: shop._id,
          name: shop.name,
          username: shop.username,
          location: shop.location,
          type: "shop",
          permissions: shop.permissions || {},
        },
      });
    }

    // User not found
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ========== LOGOUT ==========
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// ========== GET CURRENT USER ==========
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    let user;
    if (userType === "admin") {
      user = await Admin.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      const adminData = user.toObject();
      delete adminData.password;

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          type: "admin",
          role: user.role,
          isActive: user.isActive,
        },
      });
    } else if (userType === "shop") {
      user = await Shop.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Shop not found",
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          location: user.location,
          type: "shop",
          permissions: user.permissions || {},
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid user type",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get current user",
      error: error.message,
    });
  }
};
