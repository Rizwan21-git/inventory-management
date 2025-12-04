import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { shopAPI } from "../services/api";

const initialState = {
  shops: [],
  workers: [],
  selectedShop: null,
  loading: false,
  workersLoading: false,
  error: null,
  totalItems: 0,
  workersTotalItems: 0,
};

// Shop Thunks
export const fetchShops = createAsyncThunk(
  "shops/fetchShops",
  async ( { rejectWithValue }) => {
    try {
      const response = await shopAPI.getShops(page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createShop = createAsyncThunk(
  "shops/createShop",
  async (shopData, { rejectWithValue }) => {
    try {
      const response = await shopAPI.createShop(shopData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateShop = createAsyncThunk(
  "shops/updateShop",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await shopAPI.updateShop(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteShop = createAsyncThunk(
  "shops/deleteShop",
  async (id, { rejectWithValue }) => {
    try {
      await shopAPI.deleteShop(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Worker Thunks
export const fetchWorkersByShop = createAsyncThunk(
  "shops/fetchWorkersByShop",
  async ({ shopId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await shopAPI.getWorkersByShop(shopId, page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createWorker = createAsyncThunk(
  "shops/createWorker",
  async (workerData, { rejectWithValue }) => {
    try {
      const response = await shopAPI.createWorker(workerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateWorker = createAsyncThunk(
  "shops/updateWorker",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await shopAPI.updateWorker(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteWorker = createAsyncThunk(
  "shops/deleteWorker",
  async (id, { rejectWithValue }) => {
    try {
      await shopAPI.deleteWorker(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shopSlice = createSlice({
  name: "shops",
  initialState,
  reducers: {
    setSelectedShop: (state, action) => {
      state.selectedShop = action.payload;
    },
    clearSelectedShop: (state) => {
      state.selectedShop = null;
      state.workers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Shops
      .addCase(fetchShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.loading = false;
        state.shops = action.payload.shops;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Shop
      .addCase(createShop.pending, (state) => {
        state.loading = true;
      })
      .addCase(createShop.fulfilled, (state, action) => {
        state.loading = false;
        state.shops.unshift(action.payload);
        state.totalItems += 1;
      })
      .addCase(createShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Shop
      .addCase(updateShop.fulfilled, (state, action) => {
        const index = state.shops.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.shops[index] = action.payload;
        }
        if (state.selectedShop?.id === action.payload.id) {
          state.selectedShop = action.payload;
        }
      })

      // Delete Shop
      .addCase(deleteShop.fulfilled, (state, action) => {
        state.shops = state.shops.filter((s) => s.id !== action.payload);
        state.totalItems -= 1;
        if (state.selectedShop?.id === action.payload) {
          state.selectedShop = null;
          state.workers = [];
        }
      })

      // Fetch Workers by Shop
      .addCase(fetchWorkersByShop.pending, (state) => {
        state.workersLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkersByShop.fulfilled, (state, action) => {
        state.workersLoading = false;
        state.workers = action.payload.workers;
        state.workersTotalItems = action.payload.totalItems;
      })
      .addCase(fetchWorkersByShop.rejected, (state, action) => {
        state.workersLoading = false;
        state.error = action.payload;
      })

      // Create Worker
      .addCase(createWorker.pending, (state) => {
        state.workersLoading = true;
      })
      .addCase(createWorker.fulfilled, (state, action) => {
        state.workersLoading = false;
        state.workers.unshift(action.payload);
        state.workersTotalItems += 1;
        // Update shop's worker count
        const shop = state.shops.find((s) => s.id === action.payload.shopId);
        if (shop) {
          shop.workerCount = (shop.workerCount || 0) + 1;
        }
      })
      .addCase(createWorker.rejected, (state, action) => {
        state.workersLoading = false;
        state.error = action.payload;
      })

      // Update Worker
      .addCase(updateWorker.fulfilled, (state, action) => {
        const index = state.workers.findIndex(
          (w) => w.id === action.payload.id
        );
        if (index !== -1) {
          state.workers[index] = action.payload;
        }
      })

      // Delete Worker
      .addCase(deleteWorker.fulfilled, (state, action) => {
        state.workers = state.workers.filter((w) => w.id !== action.payload);
        state.workersTotalItems -= 1;
        // Update shop's worker count
        if (state.selectedShop) {
          const shop = state.shops.find((s) => s.id === state.selectedShop.id);
          if (shop && shop.workerCount > 0) {
            shop.workerCount -= 1;
          }
        }
      });
  },
});

export const { setSelectedShop, clearSelectedShop } = shopSlice.actions;
export default shopSlice.reducer;
