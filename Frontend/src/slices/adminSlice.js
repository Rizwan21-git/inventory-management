import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminAPI } from "../services/api";

// ========== ASYNC THUNKS ==========

// Fetch all admins
export const fetchAdmins = createAsyncThunk(
  "admins/fetchAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllAdmins();
      return response.data || response || [];
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch admins"
      );
    }
  }
);

// Create admin
export const createAdmin = createAsyncThunk(
  "admins/createAdmin",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await adminAPI.createAdmin(adminData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to create admin"
      );
    }
  }
);

// Update admin
export const updateAdmin = createAsyncThunk(
  "admins/updateAdmin",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateAdmin(id, data);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to update admin"
      );
    }
  }
);

// Delete admin
export const deleteAdmin = createAsyncThunk(
  "admins/deleteAdmin",
  async (id, { rejectWithValue }) => {
    try {
      await adminAPI.deleteAdmin(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to delete admin"
      );
    }
  }
);

// ========== INITIAL STATE ==========

const initialState = {
  admins: [],
  loading: false,
  error: null,
};

// ========== SLICE ==========

const adminSlice = createSlice({
  name: "admins",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Admins
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = Array.isArray(action.payload) 
          ? action.payload 
          : action.payload?.data || [];
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Admin
    builder
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.admins.push(action.payload);
        }
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Admin
    builder
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.admins.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Admin
    builder
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = state.admins.filter((a) => a._id !== action.payload);
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
