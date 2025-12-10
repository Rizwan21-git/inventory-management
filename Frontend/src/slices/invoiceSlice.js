import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invoiceAPI } from "../services/api";

// TEMPORARY: Use mock data until backend is ready
// import mockApi from '../services/mockApi';

export const fetchInvoices = createAsyncThunk(
  "invoice/fetchAll",
  async (params = {}) => {
    return await invoiceAPI.getAll(params);
  }
);

// export const fetchInvoices = createAsyncThunk(
//   'invoice/fetchAll',
//   async () => {
//     return await mockApi.getInvoices();
//   }
// );

export const fetchInvoiceById = createAsyncThunk(
  "invoice/fetchById",
  async (id) => {
    return await invoiceAPI.getById(id);
  }
);

export const createInvoice = createAsyncThunk(
  "invoice/create",
  async (data, { rejectWithValue }) => {
    try {
      return await invoiceAPI.create(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateInvoice = createAsyncThunk(
  "invoice/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await invoiceAPI.update(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteInvoice = createAsyncThunk("invoice/delete", async (id) => {
  await invoiceAPI.delete(id);
  return id;
});

export const fetchDashInvoices = createAsyncThunk(
  "invoices/dashboard",
  async (/*{ rejectWithValue }*/) => {
    try {
      return await invoiceAPI.getDashInvoices();
    } catch (error) {
      // return rejectWithValue(error);
      return error;
    }
  }
);

const invoiceSlice = createSlice({
  name: "invoice",
  initialState: {
    invoices: [],
    dashInvoices: [],
    trigger: false,
    loading: false,
    error: null,
    // totalItems: 0,
  },
  reducers: {
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.currentInvoice = action.payload;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.trigger = !state.trigger;
        state.invoices.unshift(action.payload);
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(
          (i) => i._id === action.payload._id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        // state.trigger = !state.trigger;
        state.invoices = state.invoices.filter((i) => i._id !== action.payload);
      })
      .addCase(fetchDashInvoices.fulfilled, (state, action) => {
        // Keep dashboard-specific invoices separate so we don't overwrite the main invoices list
        if (Array.isArray(action.payload)) {
          state.dashInvoices = action.payload;
        }
      });
  },
});

export const { clearCurrentInvoice, clearError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
