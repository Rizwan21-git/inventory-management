// API Configuration and Service Layer
import axios from "axios";
// import { addProfit, getProfit } from "../slices/profitSlice";
// import { addRevenue } from "../slices/revenueSlice";

const API_BASE_URL =
  import.meta.env.API_BASE_URL || "http://localhost:5000";

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
  updateStock: (id, data) => api.patch(`/inventory/${id}/stock`, data),
};

// Invoice APIs
export const invoiceAPI = {
  getAll: (params) => api.get("/invoices", { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post("/invoices", data),
  update: (id, data) => api.patch(`/invoices/${id}`, data),
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

// Dashboard APIs
export const dashboardAPI = {
  getStats: (params) => api.get("/dashboard/stats", { params }),
  getRecentActivity: () => api.get("/dashboard/activity"),
  getAvailableYears: () => api.get("/dashboard/years"),
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
