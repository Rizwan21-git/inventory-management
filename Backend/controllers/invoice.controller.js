import asyncHandler from "express-async-handler";
import { Invoice } from "../models/invoiceSchema.js";
import Admin from "../models/adminSchema.js";
import Shop from "../models/shopSchema.js";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

// Helper to get creator name from req.user
const getCreatorName = async (req) => {
  try {
    const userId = req.user?.userId;
    const userType = req.user?.userType;
    if (!userId || !userType) return "";
    if (userType === "admin") {
      const admin = await Admin.findById(userId);
      return admin ? admin.name : "";
    }
    if (userType === "shop") {
      const shop = await Shop.findById(userId);
      return shop ? shop.name : "";
    }
    return "";
  } catch (error) {
    return "";
  }
};

export const getAllInvoices = asyncHandler(async (req, res, next) => {
  const invoices = await Invoice.find({});
  res.json(invoices);
});

export const getInvoiceById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }
  res.json(invoice);
});

export const addInvoice = asyncHandler(async (req, res, next) => {
  const {
    invoiceNumber,
    invoiceType,
    name,
    address,
    phoneNumber,
    items,
    taxRate,
    discountRate,
    subtotal,
    tax,
    discount,
    total,
    profit,
    paymentStatus,
    bankUsed,
    paymentProof,
    supplierName,
    shippingCost,
    notes,
  } = req.body;
  // Basic validation
  if (!invoiceNumber || !invoiceType || !name) {
    return res.status(400).json({ message: "invoiceNumber, invoiceType and name are required" });
  }

  // Validate payment proof size if provided
  if (paymentProof) {
    try {
      const base64 = (String(paymentProof).split(",")[1] || "");
      const approxSize = Math.ceil((base64.length * 3) / 4);
      if (approxSize > MAX_FILE_SIZE) {
        return res.status(400).json({ message: "Payment proof exceeds maximum size of 1 MB" });
      }
    } catch (err) {}
  }

  const creatorName = (await getCreatorName(req)) || req.body.createdBy || "";
  if (!creatorName) {
    return res.status(400).json({ message: "Unable to determine creator name" });
  }

  const newInvoice = new Invoice({
    invoiceNumber,
    invoiceType,
    name,
    address,
    phoneNumber,
    items,
    taxRate,
    discountRate,
    subtotal,
    tax,
    discount,
    total,
    profit,
    paymentStatus,
    bankUsed,
    paymentProof,
    supplierName,
    shippingCost,
    notes,
    createdBy: creatorName,
  });
  const savedInvoice = await newInvoice.save();
  res.status(201).json(savedInvoice);
});

export const getDashInvoices = asyncHandler(async (req, res, next) => {
  try {
    // Return recent invoices for dashboard (most recent 20)
    const recentInvoices = await Invoice.find().sort({ createdAt: -1 }).limit(20);
    res.json(recentInvoices);
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch dashboard invoices");
  }
});

export const getPendingInvoices = asyncHandler(async (req, res, next) => {
  try {
    // Return invoices with paymentStatus 'pending', newest first
    const pending = await Invoice.find({ paymentStatus: 'pending' }).sort({ createdAt: -1 }).limit(50);
    res.json(pending);
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch pending invoices');
  }
});


export const updateInvoice = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  // Validate paymentProof size on update
  if (data.paymentProof) {
    try {
      const base64 = (String(data.paymentProof).split(",")[1] || "");
      const approxSize = Math.ceil((base64.length * 3) / 4);
      if (approxSize > MAX_FILE_SIZE) {
        return res.status(400).json({ message: "Payment proof exceeds maximum size of 1 MB" });
      }
    } catch (err) {}
  }
  const updatedInvoice = await Invoice.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!updatedInvoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }
  res.json(updatedInvoice);
});

export const deleteInvoice = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedInvoice = await Invoice.findByIdAndDelete(id);
  if (!deletedInvoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }
  res.json({ id });
});
