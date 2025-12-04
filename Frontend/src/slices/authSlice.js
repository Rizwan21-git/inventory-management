import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { authAPI } from "../services/api";

// TEMPORARY: Use mock data until backend is ready
import mockApi from '../services/mockApi';
import { delay } from "framer-motion";

// export const login = createAsyncThunk(
//   "auth/login",
//   async (credentials, { rejectWithValue }) => {
//     try {
//       const response = await authAPI.login(credentials);
//       localStorage.setItem("token", response.token);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await mockApi.login(credentials);
      localStorage.setItem("token", response.data.token);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    // await authAPI.logout();
  } finally {
    localStorage.removeItem("token");
  }
});

// export const getCurrentUser = createAsyncThunk(
//   "auth/getCurrentUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       return await authAPI.getCurrentUser();
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await mockApi.login();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: false,
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
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user,
        state.token = action.payload.data.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        (state.token = action.payload.data.token),
        (state.user = action.payload.data.user);
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
