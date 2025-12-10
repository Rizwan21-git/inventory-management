import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { projectAPI } from "../services/api";

export const fetchProjects = createAsyncThunk(
  "project/fetchAll",
  async () => {
    return await projectAPI.getAll();
  }
);

export const createProject = createAsyncThunk(
  "project/create",
  async (data, { rejectWithValue }) => {
    try {
      return await projectAPI.create(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteProject = createAsyncThunk(
  "project/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await projectAPI.delete(id);
      // API returns the deleted project object; return the id so reducer can filter easily
      return res?._id || id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateProjectStatus = createAsyncThunk(
  "project/updateStatus",
  async ({ id, data }) => {
    return await projectAPI.updateStatus(id, data);
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
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
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.unshift(action.payload);
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.projects = state.projects.filter((p) => p._id !== deletedId);
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      });
  },
});

export const { clearError } = projectSlice.actions;
export default projectSlice.reducer;
