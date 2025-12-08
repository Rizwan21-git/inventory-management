import { format, parseISO, isValid } from "date-fns";
import { DATE_FORMAT, DATETIME_FORMAT, BANK_LIST } from "./constants";

// Format currency
export const formatCurrency = (amount, currency = "PKR") => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
  }).format(amount || 0);
};

// Compact currency formatter for large numbers (e.g., 1.2K, 3.4M)
export const formatCompactCurrency = (amount, currency = "PKR") => {
  if (amount === null || amount === undefined) return "";
  // Use Intl.NumberFormat compact notation when available
  try {
    const nf = new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency,
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    });
    return nf.format(amount);
  } catch (e) {
    // Fallback: simple manual compact formatting
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
    return formatCurrency(amount, currency);
  }
};

// Format date
export const formatDate = (date, formatStr = DATE_FORMAT) => {
  if (!date) return "";
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return isValid(parsedDate) ? format(parsedDate, formatStr) : "";
};

// Format datetime
export const formatDateTime = (date) => {
  return formatDate(date, DATETIME_FORMAT);
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone (Pakistani format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// Format phone number
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(
      4,
      7
    )}-${cleaned.substring(7)}`;
  }
  return phone;
};

// Calculate discount
export const calculateDiscount = (original, discounted) => {
  if (!original || original === 0) return 0;
  return (((original - discounted) / original) * 100).toFixed(2);
};

// Generate random ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Debounce function
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Sort array by key
export const sortBy = (array, key, order = "asc") => {
  return [...array].sort((a, b) => {
    if (order === "asc") {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });
};

// Calculate invoice total
export const calculateInvoiceTotal = (items, tax = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.quantity * item.rate;
  }, 0);

  const taxAmount = (subtotal * tax) / 100;
  const discountAmount = (subtotal * discount) / 100;

  return {
    subtotal,
    taxAmount,
    discountAmount,
    total: subtotal + taxAmount - discountAmount,
  };
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

// Validate file type
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// Validate file size
export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    pending: "bg-warning-100 text-warning-700",
    paid: "bg-success-100 text-success-700",
    partial: "bg-primary-100 text-primary-700",
    overdue: "bg-danger-100 text-danger-700",
    in_progress: "bg-primary-100 text-primary-700",
    completed: "bg-success-100 text-success-700",
    cancelled: "bg-danger-100 text-danger-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word)
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Calculate days between dates
export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Add to helpers.js
export const getResponsiveGridCols = (screenSize) => {
  const cols = {
    mobile: "grid-cols-1",
    tablet: "md:grid-cols-2",
    desktop: "lg:grid-cols-3",
  };
  return `${cols.mobile} ${cols.tablet} ${cols.desktop}`;
};

// Calculate profit margin
export const calculateProfitMargin = (buyingPrice, sellingPrice) => {
  if (buyingPrice === 0) return 0;
  return (((sellingPrice - buyingPrice) / buyingPrice) * 100).toFixed(2);
};

/**
 * Turn a payment method value (e.g. 'bank_transfer') into a human label ('Bank Transfer')
 */
export const formatPaymentMethodLabel = (value) => {
  if (!value) return "-";
  const normalized = String(value).toLowerCase();
  // Attempt to map known method values to nice labels
  const map = {
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    cheque: "Cheque",
    mobile_wallet: "Mobile Wallet",
    card: "Card",
  };
  return map[normalized] || String(value).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Convert bank code to bank name using BANK_LIST constant (lazy lookup)
 */
export const getBankNameByCode = (code) => {
  if (!code) return "";
  const normalized = String(code).toUpperCase();
  const found = BANK_LIST.find((b) => b.code === normalized);
  if (found) return found.name;
  // sometimes mock data contains full names; return fallback cleaned value
  return String(code);
};


export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  capitalize,
  calculatePercentage,
  truncateText,
  isValidEmail,
  isValidPhone,
  formatPhone,
  calculateDiscount,
  generateId,
  debounce,
  deepClone,
  groupBy,
  getResponsiveGridCols,
  sortBy,
  calculateProfitMargin,
  calculateInvoiceTotal,
  formatFileSize,
  isValidFileType,
  isValidFileSize,
  getStatusColor,
  getInitials,
  daysBetween,
  formatPaymentMethodLabel,
  getBankNameByCode,
};
