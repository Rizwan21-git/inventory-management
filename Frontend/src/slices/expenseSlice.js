import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { expenseAPI } from "../services/api";

// TEMPORARY: Use mock data until backend is ready
import mockApi from '../services/mockApi';

// export const fetchExpenses = createAsyncThunk(
//   "expense/fetchAll",
//   async (params = {}) => {
//     return await expenseAPI.getAll(params);
//   }
// );

export const fetchExpenses = createAsyncThunk(
  "expense/fetchAll",
  async (params = {}) => {
    return await mockApi.getExpenses(params);
  }
);

export const createExpense = createAsyncThunk(
  "expense/create",
  async (data, { rejectWithValue }) => {
    try {
      return await expenseAPI.create(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateExpense = createAsyncThunk(
  "expense/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await expenseAPI.update(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteExpense = createAsyncThunk("expense/delete", async (id) => {
  await expenseAPI.delete(id);
  return id;
});

const expenseSlice = createSlice({
  name: "expense",
  initialState: {
    expenses: [],
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
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.data.expenses;
        state.totalPages = action.payload.data.totalPages;
        state.currentPage = action.payload.data.currentPage;
        state.totalItems = action.payload.data.totalItems;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(
          (e) => e.id === action.payload.id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      });
  },
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer;
