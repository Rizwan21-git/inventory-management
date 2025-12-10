import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiEye,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiSearch,
  FiPackage,
  FiCheckCircle,
} from "react-icons/fi";
import { fetchInvoices, updateInvoice } from "../../slices/invoiceSlice";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import FileUpload from "../../components/common/FileUpload";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";
import { PAYMENT_STATUS, INVOICE_TYPES } from "../../utils/constants";
import {
  formatCurrency,
  formatDate,
  debounce,
  getBankNameByCode,
} from "../../utils/helpers";

const Finance = () => {
  const dispatch = useDispatch();
  // Use invoices as source of truth for finance records (selling -> IN, buying -> OUT)
  const {
    invoices = [],
    loading,
    totalItems,
  } = useSelector((state) => state.invoice);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewProofModalOpen, setIsViewProofModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDirection, setFilterDirection] = useState("");
  const records = invoices.filter(
    (inv) => inv.invoiceType !== INVOICE_TYPES.QUOTATION
  );
  const pendingPayments = (invoices || []).filter(
    (inv) =>
      inv.paymentStatus === "pending" &&
      inv.invoiceType !== INVOICE_TYPES.QUOTATION
  );

  // helper to resolve bank direction: prefer stored bankDirection, otherwise infer from invoice type
  const resolveBankDirection = (inv) =>
    inv.bankDirection ||
    (inv.invoiceType === INVOICE_TYPES.BUYING ? "out" : "in");

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusFromUrl = params.get("paymentStatus");

    if (statusFromUrl) {
      setFilterStatus(statusFromUrl);
      toast.success(`Filtered by: ${statusFromUrl.replace("_", " ")}`);
    }
  }, [location.search]);

  const handleSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  const handleMarkAsPaid = async (record) => {
    try {
      // When marking payments as paid, update the underlying invoice and record revenue
      // For selling invoices (bankDirection === 'in'), add positive revenue
      // For buying invoices (bankDirection === 'out'), add investment

      // Persist invoice payment status
      await dispatch(
        updateInvoice({ id: record._id, data: { paymentStatus: "paid" } })
      ).unwrap();
      toast.success("Payment marked as paid!");
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  const handleFileUpload = async (files) => {
    if (!selectedRecord || files.length === 0) return;

    try {
      // Read file as data URL and patch the invoice record
      const file = files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        await dispatch(
          updateInvoice({
            id: selectedRecord._id,
            data: { paymentProof: dataUrl },
          })
        ).unwrap();
        toast.success("Payment proof uploaded successfully!");
        setIsUploadModalOpen(false);
        setSelectedRecord(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload proof");
    }
  };

  const handleViewProof = (record) => {
    setSelectedRecord(record);
    setIsViewProofModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      paid: "success",
      pending: "warning",
      partial: "primary",
      overdue: "danger",
    };
    return <Badge variant={variants[status]}>{status?.toUpperCase()}</Badge>;
  };

  const columns = [
    {
      header: "Person/ Organization",
      render: (row) => row.name,
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">
          {formatCurrency(row.total ?? row.amount ?? 0)}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => getStatusBadge(row.paymentStatus),
    },
    {
      header: "Type",
      render: (row) => row.invoiceType.replace("_", " ")?.toUpperCase(),
    },
    {
      header: "Bank",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span>{getBankNameByCode(row.bankUsed) || row.bankUsed}</span>
          <Badge
            variant={resolveBankDirection(row) === "in" ? "success" : "danger"}
          >
            {resolveBankDirection(row) === "in" ? "IN" : "OUT"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Created By",
      accessor: "createdBy",
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Mark as Paid Icon - shows for pending payments */}
          {row.paymentStatus === "pending" && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleMarkAsPaid(row)}
              className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
              title="Mark as Paid"
            >
              <FiCheckCircle className="w-5 h-5" />
            </motion.button>
          )}

          {/* Upload/View Proof - only for non-cash payments */}
          {String(row.bankUsed || "").toUpperCase() !== "CASH" && (
            <>
              {row.paymentProof === null ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="sm"
                    icon={FiUpload}
                    onClick={() => {
                      setSelectedRecord(row);
                      setIsUploadModalOpen(true);
                    }}
                  >
                    Upload Proof
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FiEye}
                    onClick={() => handleViewProof(row)}
                  >
                    View Proof
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const paymentStatuses = Object.entries(PAYMENT_STATUS).map(
    ([key, value]) => ({
      value: value.value,
      label: value.label.replace("_", " "),
    })
  );

  // Calculate totals - only from non-quotation invoices with pending status
  const totalToReceive = records
    .filter(
      (r) =>
        r.invoiceType !== INVOICE_TYPES.QUOTATION &&
        resolveBankDirection(r) === "in" &&
        r.paymentStatus === "pending"
    )
    .reduce((sum, r) => {
      const amount = Number(r.total) || Number(r.amount) || 0;
      return sum + amount;
    }, 0);

  const totalToGive = records
    .filter(
      (r) =>
        r.invoiceType !== INVOICE_TYPES.QUOTATION &&
        resolveBankDirection(r) === "out" &&
        r.paymentStatus === "pending"
    )
    .reduce((sum, r) => {
      const amount = Number(r.total) || Number(r.amount) || 0;
      return sum + amount;
    }, 0);

  // Filter records based on search, status, and direction
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      !searchTerm ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !filterStatus || record.paymentStatus === filterStatus;
    const matchesDirection =
      !filterDirection || resolveBankDirection(record) === filterDirection;
    return matchesSearch && matchesStatus && matchesDirection;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiPackage className="text-primary-600" />
            Finance & Accounts
          </h1>
          <p className="text-gray-600 mt-1">
            Track payments, revenue, and expenses
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-9"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Total to Receive */}
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{
              scale: 1.03,
              boxShadow: "0 10px 30px rgba(34, 197, 94, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    To Receive
                  </p>
                  <h3 className="text-2xl font-bold text-success-600 mt-1">
                    {formatCurrency(totalToReceive)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Pending incoming</p>
                </div>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-success-100 rounded-lg"
                >
                  <FiTrendingUp className="w-6 h-6 text-success-600" />
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-success-500" />
            </Card>
          </motion.div>
        </motion.div>

        {/* Total to Give */}
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{
              scale: 1.03,
              boxShadow: "0 10px 30px rgba(239, 68, 68, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">To Give</p>
                  <h3 className="text-2xl font-bold text-danger-600 mt-1">
                    {formatCurrency(totalToGive)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Pending outgoing</p>
                </div>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-danger-100 rounded-lg"
                >
                  <FiTrendingDown className="w-6 h-6 text-danger-600" />
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-danger-500" />
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-danger-500 bg-danger-50">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-6 h-6 text-danger-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-danger-900">
                  Pending Payments Alert
                </h3>
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <p className="text-sm text-danger-700 mt-1">
                    You have {pendingPayments.length} pending payments totaling{" "}
                    {formatCurrency(
                      pendingPayments.reduce(
                        (sum, p) => sum + Number(p.total ?? p.amount ?? 0),
                        0
                      )
                    )}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name..."
                icon={FiSearch}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[{ value: "", label: "All Status" }, ...paymentStatuses]}
              className="md:w-48"
            />
            <Select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              options={[
                { value: "", label: "All Directions" },
                { value: "in", label: "Payment IN" },
                { value: "out", label: "Payment OUT" },
              ]}
              className="md:w-48"
            />
          </div>

          {loading && records.length === 0 ? (
            <LoadingSpinner size="md" />
          ) : (
            <Table
              columns={columns}
              data={filteredRecords}
              loading={loading}
              emptyMessage="No payment records found. Add your first record to get started!"
            />
          )}
        </Card>
      </motion.div>

      {/* Upload Payment Proof Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedRecord(null);
        }}
        title="Upload Payment Proof"
        size="md"
      >
        <FileUpload
          label="Upload Payment Screenshot/Receipt"
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          onChange={handleFileUpload}
        />
      </Modal>

      {/* View Payment Proof Modal */}
      <Modal
        isOpen={isViewProofModalOpen}
        onClose={() => {
          setIsViewProofModalOpen(false);
          setSelectedRecord(null);
        }}
        title="Payment Proof"
        size="sm"
      >
        {selectedRecord?.paymentProof ? (
          <div className="space-y-4">
            <img
              src={selectedRecord.paymentProof}
              alt="Payment Proof"
              className="w-80 h-80 rounded-lg"
            />
            <div className="text-sm text-gray-600">
              <p>
                <strong>Name:</strong> {selectedRecord.name}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {formatCurrency(
                  selectedRecord.total ?? 0
                )}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(selectedRecord.createdAt)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No payment proof available
          </p>
        )}
      </Modal>
    </motion.div>
  );
};

export default Finance;
