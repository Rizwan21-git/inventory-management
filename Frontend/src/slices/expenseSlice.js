import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { expenseAPI } from "../services/api";
export const fetchExpenses = createAsyncThunk(
  "expense/fetchAll",
  async (params = {}) => {
    return await expenseAPI.getAll(params);
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
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e._id !== action.payload);
      });
  },
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer;
