import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiPackage } from "react-icons/fi";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Table from "../../components/common/Table";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { fetchInvoices } from "../../slices/invoiceSlice";

const Investment = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  //fetch investment from invoices
  const { invoices, loading, totalItems } = useSelector(
    (state) => state.invoice
  );
  const investments = invoices.filter(
    (invoice) => invoice.invoiceType === "buying"
  );

  // Filter investments based on search term
  const filteredInvestments = investments.filter(
    (investment) =>
      investment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // investment.bankUsed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatCurrency(investment.total)?.includes(searchTerm)
  );

  useEffect(() => {
    // dispatch(fetchInvestments({ page: currentPage }));
    dispatch(fetchInvoices());
  }, [dispatch]);

  const columns = [
    {
      header: "Supplier",
      render: (row) => row.name,
    },
    {
      header: "Amount Invested",
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.total)}</span>
      ),
    },
    {
      header: "Phone",
      render: (row) => <span className="capitalize">{row.phoneNumber}</span>,
    },
    {
      header: "Address",
      render: (row) => <span className="capitalize">{row.address}</span>,
    },
    {
      header: "Date",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Added By",
      accessor: "createdBy",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FiPackage className="text-primary-600" />
              Investment Tracking
            </h1>
            <p className="text-gray-600 mt-1">
              Track investments with automatic ROI calculation
            </p>
          </div>
        </div>

        <Card>
          <div className="mb-4">
            <Input
              placeholder="Search by supplier name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading && investments.length === 0 ? (
            <LoadingSpinner size="md" />
          ) : (
            <Table
              columns={columns}
              data={filteredInvestments}
              loading={loading}
              emptyMessage="No investments found. Add your first investment to get started!"
            />
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default Investment;
