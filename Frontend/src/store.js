import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import inventoryReducer from "./slices/inventorySlice";
import invoiceReducer from "./slices/invoiceSlice";
import projectReducer from "./slices/projectSlice";
import expenseReducer from "./slices/expenseSlice";
import dashboardReducer from "./slices/dashboardSlice";
import shopReducer from "./slices/shopSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer,
    invoice: invoiceReducer,
    project: projectReducer,
    expense: expenseReducer,
    dashboard: dashboardReducer,
    shops: shopReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["finance/uploadPaymentProof/fulfilled"],
        ignoredPaths: ["finance.uploadedFiles"],
      },
    }),
});

export default store;
