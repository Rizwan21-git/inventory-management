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

  console.log("dropshippingInvoices", dropshippingInvoices);

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
    // {
    //   header: "Buy Price",
    //   render: (row) => {
    //     const prices = calculateInvoicePrices(row);
    //     return (
    //       <span className="font-medium text-gray-900">
    //         {formatCurrency(prices.buyPrice)}
    //       </span>
    //     );
    //   },
    // },
    // {
    //   header: "Sell Price",
    //   render: (row) => {
    //     const prices = calculateInvoicePrices(row);
    //     return (
    //       <span className="font-semibold text-primary-600">
    //         {formatCurrency(prices.sellPrice)}
    //       </span>
    //     );
    //   },
    // },
    {
      header: "Shipping",
      render: (row) => {
        // const prices = calculateInvoicePrices(row);
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
        // const prices = calculateInvoicePrices(row);
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

          {/* Delete */}
          {/* <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button> */}
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {totalOrders}
                </h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold text-primary-600 mt-1">
                  {formatCurrency(totalSellRevenue)}
                </h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Profit
                </p>
                <h3
                  className={`text-2xl font-bold mt-1 ${
                    totalProfit >= 0 ? "text-success-600" : "text-danger-600"
                  }`}
                >
                  {formatCurrency(totalProfit)}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card>
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
