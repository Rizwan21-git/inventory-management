import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { expenseAPI } from "../services/api";

// Fetch all expenses
export const fetchExpenses = createAsyncThunk(
  "expense/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new expense
export const createExpense = createAsyncThunk(
  "expense/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete an expense
export const deleteExpense = createAsyncThunk(
  "expense/delete",
  async (id, { rejectWithValue }) => {
    try {
      await expenseAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const expenseSlice = createSlice({
  name: "expense",
  initialState: {
    expenses: [],
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
      // Fetch
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Create
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // Delete
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e._id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer;
