// API Configuration and Service Layer
import axios from "axios";
// import { addProfit, getProfit } from "../slices/profitSlice";
// import { addRevenue } from "../slices/revenueSlice";

const API_BASE_URL =
  import.meta.env.API_BASE_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh"),
};

// Inventory APIs
export const inventoryAPI = {
  getAll: (params) => api.get("/inventory", { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post("/inventory", data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get("/inventory/low-stock"),
  updateStock: (id, quantity) => api.patch(`/inventory/${id}/stock`, quantity),
};

// Finance APIs
export const financeAPI = {
  getAll: (params) => api.get("/finance", { params }),
  getById: (id) => api.get(`/finance/${id}`),
  create: (data) => api.post("/finance", data),
  update: (id, data) => api.put(`/finance/${id}`, data),
  delete: (id) => api.delete(`/finance/${id}`),
  getPendingPayments: () => api.get("/finance/pending"),
  uploadPaymentProof: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/finance/${id}/upload-proof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getRevenueReport: (params) => api.get("/finance/revenue", { params }),
  getIncomeSheet: (params) => api.get("/finance/income-sheet", { params }),
};

// Invoice APIs
export const invoiceAPI = {
  getAll: (params) => api.get("/invoices", { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post("/invoices", data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  generatePDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: "blob" }),
};

// Project APIs
export const projectAPI = {
  getAll: (params) => api.get("/projects", { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  assignWorker: (id, workerId) =>
    api.patch(`/projects/${id}/assign`, { workerId }),
  updateStatus: (id, status) => api.patch(`/projects/${id}/status`, { status }),
};

// Dropshipping APIs
export const dropshippingAPI = {
  getAll: (params) => api.get("/dropshipping", { params }),
  getById: (id) => api.get(`/dropshipping/${id}`),
  create: (data) => api.post("/dropshipping", data),
  update: (id, data) => api.put(`/dropshipping/${id}`, data),
  delete: (id) => api.delete(`/dropshipping/${id}`),
  fulfillOrder: (id) => api.patch(`/dropshipping/${id}/fulfill`),
};

// Investment APIs
export const investmentAPI = {
  getAll: (params) => api.get("/investments", { params }),
  getById: (id) => api.get(`/investments/${id}`),
  create: (data) => api.post("/investments", data),
  update: (id, data) => api.put(`/investments/${id}`, data),
  delete: (id) => api.delete(`/investments/${id}`),
  getROI: (id) => api.get(`/investments/${id}/roi`),
};

// Expense APIs
export const expenseAPI = {
  getAll: (params) => api.get("/expenses", { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getByCategory: (category) => api.get(`/expenses/category/${category}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: (params) => api.get("/dashboard/stats", { params }),
  getRecentActivity: () => api.get("/dashboard/activity"),
  getAvailableYears: () => api.get("/dashboard/years"),
};

// profit APIs
export const profitAPI = {
  getProfit: () => api.get("/profit"),
  addProfit: (data) => api.post("/profit", data),
};

// revenue APIs
export const revenueAPI = {
  getRevenue: () => api.get("/revenue"),
  addRevenue: (data) => api.post("/revenue", data),
};

export const shopAPI = {
  getShops: () => api.get("/shops"),
  getShopById: (id) => api.get(`/shops/${id}`),
  createShop: (shopData) => api.post("/shops", shopData),
  updateShop: (id, shopData) => api.put(`/shops/${id}`, shopData),
  deleteShop: (id) => api.delete(`/shops/${id}`),
  getWorkersByShop : (shopId) => api.get(`shops/${shopId}/workers`),
  getAllWorkers : () => api.get("workers"),
  createWorker : (workerData) => api.post("workers", workerData),
  updateWorker : (id, workerData) => api.put(`workers/${id}`, workerData),
  deleteWorker : (id) => api.delete(`workers/${id}`),
};

export default api;
