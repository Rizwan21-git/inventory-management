import asyncHandler from "express-async-handler";
import { Invoice } from "../models/invoiceSchema.js";

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
  console.log("at controller", id, data);
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
