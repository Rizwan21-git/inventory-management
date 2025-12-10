import Shop from "../models/shopSchema.js";
import Admin from "../models/adminSchema.js";
import Worker from "../models/workerSchema.js";
import bcrypt from "bcryptjs";

// ========== SHOP CONTROLLERS ==========

export const createShop = async (req, res) => {
  try {
    const { name, location, username, password } =
      req.body;
    // Validate required fields
    if (!name || !location || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check if username already exists
    const existingShop = await Shop.findOne({ username });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Username is not available",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newShop = new Shop({
      name,
      location,
      username,
      password: hashedPassword,
    });
    // Return shop without password

    const createdShop = await newShop.save();
    createdShop.password = "";
    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: createdShop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllShops = async (req, res) => {
  try {

    // Get shops without password
    const shops = await Shop.find()
      .select("-password")
      .sort({ createdAt: -1 })

    // Get worker count for each shop
    const shopsWithWorkerCount = await Promise.all(
      shops.map(async (shop) => {
        const workerCount = await Worker.countDocuments({ shopId: shop._id });
        return {
          ...shop.toObject(),
          workerCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Shops retrieved successfully",
      data: shopsWithWorkerCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findById(id).select("-password");

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Get worker count
    const workerCount = await Worker.countDocuments({ shopId: shop._id });

    res.status(200).json({
      success: true,
      message: "Shop retrieved successfully",
      data: {
        ...shop.toObject(),
        workerCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, username, password } = req.body;
    const shop = await Shop.findById(id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    if (username && username !== shop.username) {
      const taken = await Shop.findOne({ username });
      if (taken) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }
    }

    if (name) shop.name = name;
    if (location) shop.location = location;
    if (username) shop.username = username;

    // Only set new password if user provided it
    if (password && password.trim()) {
      shop.password = password; // plain text, hook will hash on save
    }

    const s = await shop.save();

    const shopData = s.toObject();
    delete shopData.password;

    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      data: shopData,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteShop = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findByIdAndDelete(id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Delete all workers from this shop
    await Worker.deleteMany({ shopId: id });

    res.status(200).json({
      success: true,
      message: "Shop deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const verifyShopCredentials = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Username and password are required",
//       });
//     }

//     // Find shop with username (need to select password)
//     const shop = await Shop.findOne({ username }).select("+password");

//     if (!shop) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     // Compare passwords
//     const isPasswordValid = await bcrypt.compare(password, shop.password);

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const shopData = shop.toObject();
//     delete shopData.password;

//     res.status(200).json({
//       success: true,
//       message: "Credentials verified successfully",
//       data: shopData,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// ========== WORKER CONTROLLERS ==========


export const createWorker = async (req, res) => {
  try {
    const { name, phone, email, salary, joinDate, shopId } = req.body;
    // Validate required fields
    if (!name || !phone || !email || !salary || !shopId) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Check if email already exists in this shop
    const existingWorker = await Worker.findOne({
      email: email.toLowerCase(),
      shopId,
    });
    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: "Worker with this email already exists in this shop",
      });
    }

    // Create worker (no role or permissions - inherited from shop)
    const newWorker = new Worker({
      name,
      phone,
      email: email.toLowerCase(),
      salary,
      joinDate: joinDate || new Date(),
      shopId,
    });
    const addedWorker = await newWorker.save();
    // Update shop worker count
    shop.workerCount = await Worker.countDocuments({ shopId });
    await shop.save();

    res.status(201).json({
      success: true,
      message: "Worker created successfully",
      data: addedWorker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllWorkers = async (req, res) => {
  try {
    // Get total count
    const total = await Worker.countDocuments(query);

    // Get workers
    const workers = await Worker.find(query)
      .populate("shopId", "name location")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: "Workers retrieved successfully",
      data: workers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;

    const worker = await Worker.findById(id).populate(
      "shopId",
      "name location"
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Worker retrieved successfully",
      data: worker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update worker
 * @route PUT /api/workers/:id
 */
export const updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, salary, joinDate } = req.body;

    const worker = await Worker.findById(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // Check if email is being changed and already exists
    if (email && email.toLowerCase() !== worker.email) {
      const existingWorker = await Worker.findOne({
        email: email.toLowerCase(),
        shopId: worker.shopId,
      });
      if (existingWorker) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Update fields (no role or permissions)
    if (name) worker.name = name;
    if (phone) worker.phone = phone;
    if (email) worker.email = email.toLowerCase();
    if (salary) worker.salary = salary;
    if (joinDate) worker.joinDate = joinDate;

    await worker.save();

    res.status(200).json({
      success: true,
      message: "Worker updated successfully",
      data: worker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete worker
 * @route DELETE /api/workers/:id
 */
export const deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;

    const worker = await Worker.findByIdAndDelete(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // Update shop worker count
    const shop = await Shop.findById(worker.shopId);
    if (shop) {
      shop.workerCount = await Worker.countDocuments({
        shopId: worker.shopId,
      });
      await shop.save();
    }

    res.status(200).json({
      success: true,
      message: "Worker deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get workers by shop ID with permissions
 * @route GET /api/shops/:shopId/workers
 */
export const getWorkersByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const workers = await Worker.find({ shopId }).populate(
      "shopId",
      "name location"
    );

    res.status(200).json({
      success: true,
      message: "Workers retrieved successfully",
      data: workers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get worker permissions summary
 * @route GET /api/workers/:id/permissions-summary
 */
// export const getPermissionsSummary = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const worker = await Worker.findById(id);
//     if (!worker) {
//       return res.status(404).json({
//         success: false,
//         message: "Worker not found",
//       });
//     }

//     // Count enabled permissions
//     const enabledPermissions = Object.entries(worker.permissions)
//       .filter(([_, enabled]) => enabled)
//       .map(([permission]) => permission);

//     const totalPermissions = Object.keys(worker.permissions).length;

//     res.status(200).json({
//       success: true,
//       message: "Permissions summary retrieved successfully",
//       data: {
//         workerId: worker._id,
//         workerName: worker.name,
//         totalPermissions,
//         enabledCount: enabledPermissions.length,
//         enabledPermissions,
//         allPermissions: worker.permissions,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

/**
 * Get dashboard statistics
 * @route GET /api/statistics
 */
export const getDashboardStatistics = async (req, res) => {
  try {
    const totalShops = await Shop.countDocuments({ isActive: true });
    const totalWorkers = await Worker.countDocuments({ isActive: true });

    // Get workers by role
    const workersByRole = await Worker.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Get shops by location
    const shopsByLocation = await Shop.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$location", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      data: {
        totalShops,
        totalWorkers,
        workersByRole,
        shopsByLocation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
