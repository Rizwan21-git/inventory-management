import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { revenueAPI } from "../services/api";

export const getRevenue = createAsyncThunk("profit/getProfit", async () => {
  return await revenueAPI.getRevenue();
});

export const addRevenue = createAsyncThunk(
  "profit/addProfit",
  async (data, { rejectWithValue }) => {
    try {
      const response = await revenueAPI.addRevenue(data);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const revenueSlice = createSlice({
  name: "revenue",
  initialState: {
    revenue: null,
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
      // getRevenue cases
      .addCase(getRevenue.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.revenue = action.payload;
      })
      .addCase(getRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      })
      // addRevenue cases
      .addCase(addRevenue.pending, (state) => {
        state.error = null;
      })
      .addCase(addRevenue.fulfilled, (state, action) => {
        state.revenue = action.payload;
      })
      .addCase(addRevenue.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = revenueSlice.actions;
export default revenueSlice.reducer;
