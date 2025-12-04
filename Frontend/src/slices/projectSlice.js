import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { projectAPI } from "../services/api";

// TEMPORARY: Use mock data until backend is ready
import mockApi from '../services/mockApi';

// export const fetchProjects = createAsyncThunk(
//   "project/fetchAll",
//   async (params = {}) => {
//     return await projectAPI.getAll(params);
//   }
// );

export const fetchProjects = createAsyncThunk(
  "project/fetchAll",
  async (params = {}) => {
    return await mockApi.getProjects(params);
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
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await projectAPI.update(id, data);
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
  async ({ id, status }) => {
    return await projectAPI.updateStatus(id, status);
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 1,
    totalItems: 0,
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
        state.projects = action.payload.data.projects;
        state.totalPages = action.payload.data.totalPages;
        state.currentPage = action.payload.data.currentPage;
        state.totalItems = action.payload.data.totalItems;
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
