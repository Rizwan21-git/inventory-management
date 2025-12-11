import { useEffect, useState } from "react";
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
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import FileUpload from "../../components/common/FileUpload";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";
import { INVOICE_TYPES, BANK_LIST } from "../../utils/constants";
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [acceptFormData, setAcceptFormData] = useState({
    paymentStatus: "pending",
    bankUsed: "",
    paymentProof: null,
  });
  const [isAccepting, setIsAccepting] = useState(false);

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

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

  const handlePaymentProofUpload = (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 1 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAcceptFormData({ ...acceptFormData, paymentProof: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  const openAcceptModal = (quotation) => {
    setSelectedQuotation(quotation);
    setAcceptFormData({
      paymentStatus: "pending",
      bankUsed: "",
      paymentProof: null,
    });
    setIsModalOpen(true);
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

  // Accept quotation - convert to selling invoice with payment details
  const handleAcceptQuotation = async () => {
    if (!selectedQuotation) return;

    // Validate: payment status is required
    if (!acceptFormData.paymentStatus) {
      toast.error("Payment status is required");
      return;
    }

    // Validate: bank used is required
    if (!acceptFormData.bankUsed) {
      toast.error("Bank / Payment method is required");
      return;
    }

    // Validate: payment proof required if paid and not cash
    if (
      acceptFormData.paymentStatus === "paid" &&
      acceptFormData.bankUsed !== "cash" &&
      !acceptFormData.paymentProof
    ) {
      toast.error("Payment proof is required for paid non-cash payments");
      return;
    }

    setIsAccepting(true);
    try {
      // Process each item: decrease inventory
      // Convert quotation type to selling with payment details
      const updateData = {
        invoiceType: INVOICE_TYPES.SELLING,
        paymentStatus: acceptFormData.paymentStatus,
        bankUsed: acceptFormData.bankUsed,
      };

      // Add payment proof if provided
      if (acceptFormData.paymentProof) {
        updateData.paymentProof = acceptFormData.paymentProof;
      }

      // Step 1: Validate all items first
      for (const item of selectedQuotation.items) {
        const product = getSelectedProduct(item.productId);
        if (!product) continue;

        const newQuantity = (product.quantity || 0) - item.quantity;

        if (newQuantity < 0) {
          toast.error(`Insufficient stock for product: ${product.name}`);
          throw new Error("Insufficient stock");
        }
      }

      await Promise.all(
        selectedQuotation.items.map(async (item) => {
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

      await dispatch(
        updateInvoice({
          id: selectedQuotation._id,
          data: updateData,
        })
      ).unwrap();

      toast.success("Quotation accepted and converted to selling invoice!");
      setIsModalOpen(false);
      setSelectedQuotation(null);
    } catch (error) {
      toast.error(error?.message || "Failed to accept quotation");
    } finally {
      setIsAccepting(false);
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            loading={loading}
            onClick={() => handlePreviewPDF(row)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Preview"
          >
            <FiEye className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            loading={loading}
            onClick={() => handleDownloadPDF(row)}
            className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
            title="Download PDF"
          >
            <FiDownload className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            loading={loading}
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
            onClick={() => openAcceptModal(row)}
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
      {/* Accept Quotation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQuotation(null);
        }}
        title="Accept Quotation"
      >
        {selectedQuotation && (
          <div className="space-y-4">
            {/* Quotation Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Quotation #{selectedQuotation.invoiceNumber}
              </p>
              <p className="font-semibold text-gray-900">
                {selectedQuotation.name}
              </p>
              <p className="text-lg font-bold text-primary-600 mt-1">
                {formatCurrency(selectedQuotation.total)}
              </p>
            </div>

            {/* Payment Status */}
            <Select
              required
              label="Payment Status"
              value={acceptFormData.paymentStatus}
              onChange={(e) =>
                setAcceptFormData({
                  ...acceptFormData,
                  paymentStatus: e.target.value,
                })
              }
              options={[
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
              ]}
            />

            {/* Bank Selection */}
            <Select
              required
              label="Bank / Payment Method"
              value={acceptFormData.bankUsed}
              onChange={(e) =>
                setAcceptFormData({
                  ...acceptFormData,
                  bankUsed: e.target.value,
                })
              }
              options={[
                { value: "", label: "Select a bank..." },
                ...BANK_LIST.map((bank) => ({
                  value: bank.code.toLowerCase(),
                  label: bank.name,
                })),
              ]}
            />

            {/* Payment Proof Upload - Show only if paid and not cash */}
            {acceptFormData.paymentStatus === "paid" &&
              acceptFormData.bankUsed !== "cash" && (
                <div>
                  <FileUpload
                    required
                    label="Payment Proof (Required - Max 1 MB)"
                    accept="image/*,.pdf"
                    onChange={(files) => handlePaymentProofUpload(files)}
                  />
                  {acceptFormData.paymentProof && (
                    <p className="text-sm text-success-600 mt-2">
                      ✓ Payment proof uploaded
                    </p>
                  )}
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedQuotation(null);
                }}
              >
                Cancel
              </Button>
              <Button
                isLoading={isAccepting}
                loading={loading}
                onClick={handleAcceptQuotation}
              >
                Accept
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <div className="flex flex-row items-start gap-2 align-middle justify-center">
            <FiFileText className="text-primary-600 text-xl my-auto" />
            <h1 className="text-xl lg:text-3xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Quotation Management
            </h1>
          </div>
          <p className="text-gray-600 text-xs md:text-sm lg:text-xl mt-1">
            View, manage, and respond to quotations
          </p>
        </div>
      </motion.div>

      {/* Table Card */}
      <Card className={"mb-9"}>
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
