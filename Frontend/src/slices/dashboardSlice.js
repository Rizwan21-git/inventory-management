import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardAPI } from '../services/api';

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (params = {}) => {
    return await dashboardAPI.getStats(params);
  }
);

export const fetchRecentActivity = createAsyncThunk(
  "dashboard/fetchActivity",
  async () => {
    return await dashboardAPI.getRecentActivity();
  }
);

export const fetchAvailableYears = createAsyncThunk(
  "dashboard/fetchYears",
  async () => {
    return await dashboardAPI.getAvailableYears();
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: null,
    availableYears: [],
    recentActivity: [],
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
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.recentActivity = action.payload;
      })
      .addCase(fetchAvailableYears.fulfilled, (state, action) => {
        // API returns an array of available years
        state.availableYears = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
