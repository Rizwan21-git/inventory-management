import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiDownload,
  FiEye,
  FiPrinter,
  FiFileText,
  FiCheck,
  FiX,
} from "react-icons/fi";
import {
  fetchInvoices,
  updateInvoice,
  deleteInvoice,
} from "../../slices/invoiceSlice";
import {
  fetchInventory,
  updateInventoryItem,
} from "../../slices/inventorySlice";
import Card from "../../components/common/Card";
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

const Quotation = () => {
  const dispatch = useDispatch();
  const { invoices, loading } = useSelector((state) => state.invoice);
  const { items: inventoryItems } = useSelector((state) => state.inventory);

  // Fetch invoices and inventory on component mount
  useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchInventory({}));
  }, [dispatch]);

  // Filter only quotations
  const quotations = invoices.filter(
    (inv) => inv.invoiceType === INVOICE_TYPES.QUOTATION
  );

  // Helper: Get selected product from inventory
  const getSelectedProduct = (productId) => {
    return inventoryItems?.find(
      (p) => p.id === productId || p._id === productId
    );
  };

  const handleDownloadPDF = (quotation) => {
    try {
      downloadInvoicePDF(quotation);
      toast.success("Quotation downloaded!");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const handlePreviewPDF = (quotation) => {
    try {
      previewInvoicePDF(quotation);
    } catch (error) {
      toast.error("Failed to preview PDF");
    }
  };

  const handlePrintPDF = (quotation) => {
    try {
      printInvoicePDF(quotation);
      toast.success("Printing quotation...");
    } catch (error) {
      toast.error("Failed to print PDF");
    }
  };

  // Accept quotation - convert to selling invoice
  const handleAcceptQuotation = async (quotationId) => {
    const quotation = quotations.find((qt) => qt._id === quotationId);
    if (!quotation) {
      toast.error("Quotation not found");
      return;
    }

    if (
      window.confirm(
        "Accept this quotation? It will be converted to a selling invoice and inventory will be updated."
      )
    ) {
      try {
        // Process each item: decrease inventory, record profit/revenue
        await Promise.all(
          quotation.items.map(async (item) => {
            const product = getSelectedProduct(item.productId);
            if (!product) return;

            // Decrease inventory
            const newQuantity = (product.quantity || 0) - item.quantity;
            await dispatch(
              updateInventoryItem({
                id: product._id,
                data: { quantity: newQuantity },
              })
            ).unwrap();
          })
        );

        // Convert quotation type to selling
        await dispatch(
          updateInvoice({
            id: quotationId,
            data: {
              invoiceType: INVOICE_TYPES.SELLING,
              paymentStatus: "pending",
              bankUsed: "",
            },
          })
        ).unwrap();

        toast.success("Quotation accepted and converted to selling invoice!");
      } catch (error) {
        toast.error(error?.message || "Failed to accept quotation");
      }
    }
  };

  // Reject quotation - delete from database
  const handleRejectQuotation = async (quotationId) => {
    if (
      window.confirm("Reject this quotation? It will be permanently deleted.")
    ) {
      try {
        await dispatch(deleteInvoice(quotationId)).unwrap();
        toast.success("Quotation rejected and deleted!");
      } catch (error) {
        toast.error("Failed to reject quotation");
      }
    }
  };

  // const getStatusBadge = (status) => {
  //   return <Badge variant="warning">PENDING</Badge>;
  // };

  const columns = [
    { header: "Quotation #", accessor: "invoiceNumber" },
    {
      header: "Customer",
      render: (row) => row.name,
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.total)}</span>
      ),
    },
    // {
    //   header: "Status",
    //   render: (row) => getStatusBadge(row.invoiceType),
    // },
    {
      header: "Date",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePreviewPDF(row)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Preview"
          >
            <FiEye className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDownloadPDF(row)}
            className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
            title="Download PDF"
          >
            <FiDownload className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePrintPDF(row)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Print"
          >
            <FiPrinter className="w-4 h-4" />
          </motion.button>

          {/* Accept Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAcceptQuotation(row._id)}
            className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
            title="Accept Quotation"
          >
            <FiCheck className="w-4 h-4" />
          </motion.button>

          {/* Reject Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRejectQuotation(row._id)}
            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
            title="Reject Quotation"
          >
            <FiX className="w-4 h-4" />
          </motion.button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiFileText className="text-primary-600" />
            Quotation Management
          </h1>
          <p className="text-gray-600 mt-1">
            View, manage, and respond to quotations
          </p>
        </div>
      </motion.div>

      {/* Table Card */}
      <Card>
        {loading && quotations.length === 0 ? (
          <LoadingSpinner size="md" />
        ) : (
          <Table
            columns={columns}
            data={quotations}
            loading={loading}
            emptyMessage="No quotations found. Create quotations from the Invoice page."
          />
        )}
      </Card>
    </motion.div>
  );
};

export default Quotation;
