import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { shopAPI } from "../services/api"

// ========== ASYNC THUNKS ==========

// Fetch all shops
export const fetchShops = createAsyncThunk(
  "shops/fetchShops",
  async (_, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getShops();
      return response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch shops"
      );
    }
  }
);

// Fetch workers by shop
export const fetchWorkersByShop = createAsyncThunk(
  "shops/fetchWorkersByShop",
  async (shopId, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getWorkersByShop(shopId);
      return response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch workers"
      );
    }
  }
);

// Create shop
export const createShop = createAsyncThunk(
  "shops/createShop",
  async (shopData, { rejectWithValue }) => {
    try {
      const response = await shopAPI.createShop(shopData);
      return response.data || [];
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.message,
        "Failed to create shop"
      );
    }
  }
);

// Update shop
export const updateShop = createAsyncThunk(
  "shops/updateShop",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await shopAPI.updateShop(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update shop"
      );
    }
  }
);

// Delete shop
export const deleteShop = createAsyncThunk(
  "shops/deleteShop",
  async (id, { rejectWithValue }) => {
    try {
      await shopAPI.deleteShop(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete shop"
      );
    }
  }
);

// Create worker
export const createWorker = createAsyncThunk(
  "shops/createWorker",
  async (workerData, { rejectWithValue }) => {
    try {
      console.log("worker data at slice", workerData)
      const response = await shopAPI.createWorker(workerData);
      console.log("at slice response ",response)
      return [];
      // return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to create worker"
      );
    }
  }
);

// Update worker
export const updateWorker = createAsyncThunk(
  "shops/updateWorker",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await shopAPI.updateWorker(id, data);
      console.log(response)
      return response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update worker"
      );
    }
  }
);

// Delete worker
export const deleteWorker = createAsyncThunk(
  "shops/deleteWorker",
  async (id, { rejectWithValue }) => {
    try {
      await shopAPI.deleteWorker(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to delete worker"
      );
    }
  }
);

// Update worker permissions
export const updateWorkerPermissions = createAsyncThunk(
  "shops/updateWorkerPermissions",
  async ({ id, permissions }, { rejectWithValue }) => {
    try {
      const response = await shopAPI.updateWorker(id, { permissions });
      console.log(response)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to update permissions"
      );
    }
  }
);

// ========== INITIAL STATE ==========

const initialState = {
  shops: [],
  workers: 0,
  selectedShop: null,
  loading: false,
  workersLoading: false,
  error: null,
};

// ========== SLICE ==========

const shopSlice = createSlice({
  name: "shops",
  initialState,
  reducers: {
    // Set selected shop
    setSelectedShop: (state, action) => {
      state.selectedShop = action.payload;
    },
    // Clear selected shop
    clearSelectedShop: (state) => {
      state.selectedShop = null;
      state.workers = [];
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ========== FETCH SHOPS ==========
    builder
      .addCase(fetchShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.loading = false;
        state.shops = action.payload;
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ========== FETCH WORKERS BY SHOP ==========
    builder
      .addCase(fetchWorkersByShop.pending, (state) => {
        state.workersLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkersByShop.fulfilled, (state, action) => {
        state.workersLoading = false;
        state.workers = action.payload;
      })
      .addCase(fetchWorkersByShop.rejected, (state, action) => {
        state.workersLoading = false;
        state.error = action.payload;
      });

    // ========== CREATE SHOP ==========
    builder
      .addCase(createShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShop.fulfilled, (state, action) => {
        state.loading = false;
        state.shops.push(action.payload);
      })
      .addCase(createShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ========== UPDATE SHOP ==========
    builder
      .addCase(updateShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShop.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.shops.findIndex(
          (shop) => shop._id === action.payload._id
        );
        if (index !== -1) {
          state.shops[index] = action.payload;
        }
        if (
          state.selectedShop &&
          state.selectedShop._id === action.payload._id
        ) {
          state.selectedShop = action.payload;
        }
      })
      .addCase(updateShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ========== DELETE SHOP ==========
    builder
      .addCase(deleteShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShop.fulfilled, (state, action) => {
        state.loading = false;
        state.shops = state.shops.filter((shop) => shop._id !== action.payload);
        if (state.selectedShop?._id === action.payload) {
          state.selectedShop = null;
          state.workers = [];
        }
      })
      .addCase(deleteShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ========== CREATE WORKER ==========
    builder
      .addCase(createWorker.pending, (state) => {
        state.workersLoading = true;
        state.error = null;
      })
      .addCase(createWorker.fulfilled, (state, action) => {
        state.workersLoading = false;
        state.workers.push(action.payload);
      })
      .addCase(createWorker.rejected, (state, action) => {
        state.workersLoading = false;
        state.error = action.payload;
      });

    // ========== UPDATE WORKER ==========
    builder
      .addCase(updateWorker.pending, (state) => {
        state.workersLoading = true;
        state.error = null;
      })
      .addCase(updateWorker.fulfilled, (state, action) => {
        state.workersLoading = false;
        const index = state.workers.findIndex(
          (worker) => worker._id === action.payload._id
        );
        if (index !== -1) {
          state.workers[index] = action.payload;
        }
      })
      .addCase(updateWorker.rejected, (state, action) => {
        state.workersLoading = false;
        state.error = action.payload;
      });

    // ========== DELETE WORKER ==========
    builder
      .addCase(deleteWorker.pending, (state) => {
        state.workersLoading = true;
        state.error = null;
      })
      .addCase(deleteWorker.fulfilled, (state, action) => {
        state.workersLoading = false;
        state.workers = state.workers.filter(
          (worker) => worker._id !== action.payload
        );
      })
      .addCase(deleteWorker.rejected, (state, action) => {
        state.workersLoading = false;
        state.error = action.payload;
      });

    // ========== UPDATE WORKER PERMISSIONS ==========
    builder
      .addCase(updateWorkerPermissions.pending, (state) => {
        state.workersLoading = true;
        state.error = null;
      })
      .addCase(updateWorkerPermissions.fulfilled, (state, action) => {
        state.workersLoading = false;
        const index = state.workers.findIndex(
          (worker) => worker._id === action.payload._id
        );
        if (index !== -1) {
          state.workers[index] = action.payload;
        }
      })
      .addCase(updateWorkerPermissions.rejected, (state, action) => {
        state.workersLoading = false;
        state.error = action.payload;
      });
  },
});

// ========== EXPORTS ==========

export const { setSelectedShop, clearSelectedShop, clearError } =
  shopSlice.actions;

export default shopSlice.reducer;