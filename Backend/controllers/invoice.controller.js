import asyncHandler from "express-async-handler";
import { Invoice } from "../models/invoiceSchema.js";

export const getAllInvoices = asyncHandler(async (req, res, next) => {
  const invoices = await Invoice.find({});
  res.json(invoices);
});

export const getInvoiceById = asyncHandler (async (req, res, next) =>{
  const {id} = req.params;
  const invoice = await Invoice.findById(id)
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }
})

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

export const updateInvoice = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data  = req.body;
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
