import express from "express"

const invoiceRoutes = express.Router();

import {getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice, addInvoice} from "../controllers/invoice.controller.js"


invoiceRoutes.get("/", getAllInvoices);
invoiceRoutes.post("/", addInvoice);
invoiceRoutes.patch("/:id", updateInvoice);
invoiceRoutes.get("/:id", getInvoiceById);
invoiceRoutes.delete("/:id", deleteInvoice);

export default invoiceRoutes;