import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiDownload,
  FiEye,
  FiTrash2,
  FiCheckCircle,
  FiPackage,
  FiPrinter,
} from "react-icons/fi";
import {
  fetchInvoices,
  deleteInvoice,
  updateInvoice,
} from "../../slices/invoiceSlice";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";
import { INVOICE_TYPES } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/helpers";
import {
  downloadInvoicePDF,
  previewInvoicePDF,
  printInvoicePDF,
} from "../../utils/pdfGenerator";

const Dropshipping = () => {
  const dispatch = useDispatch();
  const { invoices, loading } = useSelector((state) => state.invoice);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  // Filter only dropshipping invoices
  const dropshippingInvoices = invoices.filter(
    (inv) => inv.invoiceType === INVOICE_TYPES.DROPSHIPPING
  );

  // Filter by search term
  const filteredInvoices = dropshippingInvoices.filter(
    (inv) =>
      inv.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = (invoice) => {
    try {
      downloadInvoicePDF(invoice);
      toast.success("Invoice downloaded!");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const handlePreviewPDF = (invoice) => {
    try {
      previewInvoicePDF(invoice);
    } catch (error) {
      toast.error("Failed to preview PDF");
    }
  };

  const handlePrintPDF = (invoice) => {
    try {
      printInvoicePDF(invoice);
      toast.success("Printing invoice...");
    } catch (error) {
      toast.error("Failed to print PDF");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await dispatch(deleteInvoice(id)).unwrap();
        toast.success("Order deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };

  // Helper: Calculate totals from items
  const calculateInvoicePrices = (invoice) => {
    let totalBuyPrice = 0;
    let totalSellPrice = 0;

    if (invoice.items && Array.isArray(invoice.items)) {
      invoice.items.forEach((item) => {
        totalBuyPrice += item.lineTotal
          ? item.lineTotal /
            (item.unitPrice && item.unitPrice > 0 ? item.unitPrice : 1)
          : 0;
        totalSellPrice += item.lineTotal || 0;
      });
    }

    const shippingCost = invoice.shippingCost || 0;
    const profit = totalSellPrice - totalBuyPrice - shippingCost;

    return {
      buyPrice: totalBuyPrice,
      sellPrice: totalSellPrice,
      shippingCost,
      profit,
    };
  };

  const columns = [
    {
      header: "Invoice #",
      accessor: "invoiceNumber",
    },
    {
      header: "Customer",
      render: (row) => row.name,
    },
    {
      header: "Supplier",
      render: (row) => row.supplierName || "N/A",
    },
    {
      header: "Shipping",
      render: (row) => {
        return (
          <span className="font-medium text-gray-900">
            {formatCurrency(row.shippingCost)}
          </span>
        );
      },
    },
    {
      header: "Profit",
      render: (row) => {
        return (
          <span
            className={`font-bold ${
              row.profit >= 0 ? "text-success-600" : "text-danger-600"
            }`}
          >
            {formatCurrency(row.profit)}
          </span>
        );
      },
    },
    {
      header: "Payment",
      render: (row) => (
        <Badge variant={row.paymentStatus === "paid" ? "success" : "warning"}>
          {row.paymentStatus?.toUpperCase() || "N/A"}
        </Badge>
      ),
    },
    {
      header: "Date",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Created By",
      accessor: "createdBy",
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePreviewPDF(row)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Preview"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownloadPDF(row)}
            className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
            title="Download PDF"
          >
            <FiDownload className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePrintPDF(row)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Print"
          >
            <FiPrinter className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Calculate totals
  const totalOrders = filteredInvoices.length;
  const totalSellRevenue = filteredInvoices.reduce((sum, inv) => {
    // const prices = calculateInvoicePrices(inv);
    return sum + inv.total;
  }, 0);
  const totalProfit = filteredInvoices.reduce((sum, inv) => {
    // const prices = calculateInvoicePrices(inv);
    return sum + inv.profit;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FiPackage className="text-primary-600" />
              Dropshipping Orders
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage dropshipping orders
            </p>
          </div>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Orders */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition relative">
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-b-2xl"></div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Orders
                </p>
                <h3 className="text-3xl font-semibold text-gray-900 mt-1">
                  {totalOrders}
                </h3>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3h18l-1.5 14h-15L3 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition relative">
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-purple-500 rounded-b-2xl"></div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Revenue
                </p>
                <h3 className="text-3xl font-semibold text-primary-600 mt-1">
                  {formatCurrency(totalSellRevenue)}
                </h3>
              </div>

              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8c-4.5 0-8 1.79-8 4s3.5 4 4 4 8-1.79 8-4-3.5-4-8-4z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Profit */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition relative">
            <div
              className={`absolute bottom-0 left-0 w-full h-[3px] rounded-b-2xl ${
                totalProfit >= 0 ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Profit
                </p>
                <h3
                  className={`text-3xl font-semibold mt-1 ${
                    totalProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(totalProfit)}
                </h3>
              </div>

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  totalProfit >= 0 ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    totalProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d={
                      totalProfit >= 0
                        ? "M5 12l5 5L20 7"
                        : "M6 18L18 6M6 6l12 12"
                    }
                  />
                </svg>
              </div>
            </div>
          </div>
        </div> 

        {/* Table */}
        <Card className={"mb-12"}>
          <div className="mb-4">
            <Input
              placeholder="Search by invoice #, customer name, or supplier name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading && filteredInvoices.length === 0 ? (
            <LoadingSpinner size="md" />
          ) : (
            <Table
              columns={columns}
              data={filteredInvoices}
              loading={loading}
              emptyMessage="No dropshipping orders found. Create orders from the Invoice page."
            />
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default Dropshipping;
