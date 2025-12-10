import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js";

const invoiceRoutes = express.Router();

import {getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice, addInvoice} from "../controllers/invoice.controller.js"


invoiceRoutes.get("/", getAllInvoices);
invoiceRoutes.post("/", authMiddleware, addInvoice);
invoiceRoutes.patch("/:id", authMiddleware, updateInvoice);
invoiceRoutes.get("/:id", getInvoiceById);
invoiceRoutes.delete("/:id", authMiddleware, deleteInvoice);

export default invoiceRoutes;