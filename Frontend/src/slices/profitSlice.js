import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { profitAPI } from "../services/api";

export const getProfit = createAsyncThunk(
  "profit/getProfit",
  async (_, { rejectWithValue }) => {
    try {
      return await profitAPI.getProfit();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profit"
      );
    }
  }
);

export const addProfit = createAsyncThunk(
  "profit/addProfit",
  async (data, { rejectWithValue }) => {
    try {
      const response = await profitAPI.addProfit(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add profit"
      );
    }
  }
);

const profitSlice = createSlice({
  name: "profit",
  initialState: {
    profit: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Profit
      .addCase(getProfit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfit.fulfilled, (state, action) => {
        state.loading = false;
        state.profit = action.payload;
      })
      .addCase(getProfit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Profit
      .addCase(addProfit.pending, (state) => {
        state.error = null;
      })
      .addCase(addProfit.fulfilled, (state, action) => {
        state.error = null;
      })
      .addCase(addProfit.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = profitSlice.actions;
export default profitSlice.reducer;
