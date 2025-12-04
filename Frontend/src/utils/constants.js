// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  ALL_CATEGORIES: "",
  DOORS: "doors",
  HOME_INTERIOR: "home_interior",
};

// Product Conditions
export const PRODUCT_CONDITIONS = {
  NEW: "new",
  USED: "used",
  REFURBISHED: "refurbished",
};
// Invoice Types
export const INVOICE_TYPES = {
  BUYING: "buying",
  SELLING: "selling",
  QUOTATION: "quotation",
  DROPSHIPPING: "dropshipping",
};

// Payment Status
export const PAYMENT_STATUS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
];

// Project Status
export const PROJECT_STATUS = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

// Expense Categories
export const EXPENSE_CATEGORIES = {
  RENT: "rent",
  TRANSPORT: "transport",
  BILLS: "bills",
  GUESTS: "guests",
  SERVICE: "service",
  PURCHASING: "purchasing",
  OTHER: "other",
};

// Bank List (Pakistani Banks)
export const BANK_LIST = [
  { id: 1, name: "HBL (Habib Bank Limited)", code: "HBL" },
  { id: 2, name: "UBL (United Bank Limited)", code: "UBL" },
  { id: 3, name: "MCB (Muslim Commercial Bank)", code: "MCB" },
  { id: 4, name: "NBP (National Bank of Pakistan)", code: "NBP" },
  { id: 5, name: "Meezan Bank", code: "MEEZAN" },
  { id: 6, name: "Bank Alfalah", code: "ALFALAH" },
  { id: 7, name: "Allied Bank", code: "ABL" },
  { id: 8, name: "Faysal Bank", code: "FAYSAL" },
  { id: 9, name: "Standard Chartered", code: "SCB" },
  { id: 10, name: "Bank Al Habib", code: "BAH" },
  { id: 11, name: "Askari Bank", code: "ASKARI" },
  { id: 12, name: "Soneri Bank", code: "SONERI" },
  { id: 13, name: "JS Bank", code: "JSBANK" },
  { id: 14, name: "Silk Bank", code: "SILK" },
  { id: 15, name: "Bank Islami", code: "ISLAMI" },
  { id: 16, name: "JazzCash", code: "JAZZ" },
  { id: 17, name: "EasyPaisa", code: "EASY" },
  { id: 18, name: "Cash", code: "CASH" },
];

// Payment Methods
export const PAYMENT_METHODS = {
  BANK_TRANSFER: "bank_transfer",
  CASH: "cash",
  CHEQUE: "cheque",
  MOBILE_WALLET: "mobile_wallet",
  CARD: "card",
};

// Date Formats
export const DATE_FORMAT = "dd/MM/yyyy";
export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";

// Stock Alert Threshold
export const LOW_STOCK_THRESHOLD = 10;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = {
  IMAGE: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  DOCUMENT: ["application/pdf", "image/jpeg", "image/png"],
};

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: "Login successful!",
    LOGOUT: "Logged out successfully!",
    CREATE: "Created successfully!",
    UPDATE: "Updated successfully!",
    DELETE: "Deleted successfully!",
    UPLOAD: "File uploaded successfully!",
  },
  ERROR: {
    LOGIN: "Login failed. Please check your credentials.",
    NETWORK: "Network error. Please try again.",
    GENERIC: "Something went wrong. Please try again.",
    FILE_SIZE: "File size exceeds the maximum limit.",
    FILE_TYPE: "Invalid file type.",
  },
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: "#0ea5e9",
  SUCCESS: "#22c55e",
  DANGER: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#6366f1",
  SECONDARY: "#64748b",
};

export default {
  USER_ROLES,
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  INVOICE_TYPES,
  PAYMENT_STATUS,
  PROJECT_STATUS,
  EXPENSE_CATEGORIES,
  BANK_LIST,
  PAYMENT_METHODS,
  DATE_FORMAT,
  DATETIME_FORMAT,
  LOW_STOCK_THRESHOLD,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  TOAST_MESSAGES,
  CHART_COLORS,
};
