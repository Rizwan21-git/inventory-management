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

export const updateProject = createAsyncThunk(
  "project/update",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await projectAPI.update(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteProject = createAsyncThunk("project/delete", async (id) => {
  await projectAPI.delete(id);
  return id;
});

export const assignWorker = createAsyncThunk(
  "project/assignWorker",
  async ({ id, workerId }) => {
    return await projectAPI.assignWorker(id, workerId);
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
    currentProject: null,
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
        state.projects.unshift(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })
      .addCase(assignWorker.fulfilled, (state, action) => {
        const index = state.projects.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        const index = state.projects.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      });
  },
});

export const { clearError } = projectSlice.actions;
export default projectSlice.reducer;
