import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { inventoryAPI } from "../services/api";

// Fetch all inventory items
export const fetchInventory = createAsyncThunk(
  "inventory/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getAll(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch item by ID
export const fetchInventoryById = createAsyncThunk(
  "inventory/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Create a new inventory item
export const createInventoryItem = createAsyncThunk(
  "inventory/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.create(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update inventory item
export const updateInventoryItem = createAsyncThunk(
  "inventory/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.update(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete inventory item
export const deleteInventoryItem = createAsyncThunk(
  "inventory/delete",
  async (id, { rejectWithValue }) => {
    try {
      await inventoryAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update stock only
export const updateStock = createAsyncThunk(
  "inventory/updateStock",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.updateStock(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch low-stock items
export const fetchLowStock = createAsyncThunk(
  "inventory/lowStock",
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getLowStock();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    items: [],
    currentItem: null,
    lowStockItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchInventoryById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchInventoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update stock
      .addCase(updateStock.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateStock.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Low stock
      .addCase(fetchLowStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockItems = action.payload;
      })
      .addCase(fetchLowStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentItem, clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
