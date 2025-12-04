import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { inventoryAPI } from "../services/api";
// TEMPORARY: Use mock data until backend is ready
import mockApi from "../services/mockApi";

// export const fetchInventory = createAsyncThunk(
//   "inventory/fetchAll",
//   async (params = {}) => {
//     return await inventoryAPI.getAll(params);
//   }
// );

export const fetchInventory = createAsyncThunk(
  "inventory/fetchInventory",
  async (params) => {
    const response = await mockApi.getInventory(params);
    return response.data;
  }
);

export const fetchInventoryById = createAsyncThunk(
  "inventory/fetchById",
  async (id) => {
    return await inventoryAPI.getById(id);
  }
);

export const createInventoryItem = createAsyncThunk(
  "inventory/create",
  async (data, { rejectWithValue }) => {
    try {
      return await inventoryAPI.create(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  "inventory/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await inventoryAPI.update(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  "inventory/delete",
  async (id, { rejectWithValue }) => {
    try {
      await inventoryAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchLowStock = createAsyncThunk(
  "inventory/fetchLowStock",
  async () => {
    return await inventoryAPI.getLowStock();
  }
);

export const updateStock = createAsyncThunk(
  "inventory/updateStock",
  async (id, quantity, { rejectWithValue }) => {
    try{
      return await inventoryAPI.updateStock(id, quantity);
    } catch(err){
      return rejectWithValue(err)
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
    totalItems: 0,
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
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch by ID
      .addCase(fetchInventoryById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      // Create
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.totalItems += 1;
      })
      // Update
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.totalItems -= 1;
      })
      // Low stock
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStockItems = action.payload;
      })
      //update stock
      .addCase(updateStock.rejected, (state)=>{
        state.error = action.payload;
      })
  },
});

export const { clearCurrentItem, clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
