import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPieChart,
  FiPackage,
} from "react-icons/fi";
import {
  fetchExpenses,
  createExpense,
  deleteExpense,
} from "../../slices/expenseSlice";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";
import { EXPENSE_CATEGORIES } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/helpers";
import FileUpload from "../../components/common/FileUpload";

const Expenses = () => {
  const dispatch = useDispatch();
  const { expenses, loading, totalItems } = useSelector(
    (state) => state.expense
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [isViewProofModalOpen, setIsViewProofModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    expenseName: "",
    category: "",
    amount: "",
    proof: null,
    notes: "",
  });

  useEffect(() => {
    dispatch(fetchExpenses({}));
  }, [dispatch]);

  // Filter expenses locally based on category and search term
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory =
      !filterCategory || expense.category === filterCategory;
    const matchesSearch =
      expense.expenseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatCurrency(expense.amount).includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, proof: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createExpense(formData)).unwrap();
      toast.success("Expense added successfully!");
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await dispatch(deleteExpense(id)).unwrap();
        toast.success("Expense deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete expense");
      }
    }
  };

  const handleViewProof = (record) => {
    setSelectedRecord(record);
    setIsViewProofModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      expenseName: "",
      category: "",
      amount: "",
      proof: null,
      notes: "",
    });
  };

  const getCategoryBadge = (category) => {
    const colors = {
      rent: "primary",
      transportation: "warning",
      bills: "danger",
      guests: "success",
      service: "primary",
      purchasing: "warning",
      other: "gray",
    };
    return (
      <Badge variant={colors[category] || "gray"}>
        {category.toUpperCase()}
      </Badge>
    );
  };

  const columns = [
    { header: "Expense Name", accessor: "expenseName" },
    {
      header: "Category",
      render: (row) => getCategoryBadge(row.category),
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: "Date",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Proof",
      render: (row) => (
        <>
          {row.proof != null ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                icon={FiEye}
                onClick={() => handleViewProof(row)}
              >
                View Proof
              </Button>
            </motion.div>
          ) : (
            "----------------------"
          )}
        </>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const categoryOptions = Object.entries(EXPENSE_CATEGORIES).map(
    ([key, value]) => ({
      value,
      label: key.replace("_", " "),
    })
  );

  // Calculate category totals from filtered expenses
  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiPackage className="text-primary-600" />
            Expense Control
          </h1>
          <p className="text-gray-600 mt-1">
            Track and categorize all business expenses
          </p>
        </div>

        <Button
          whileHover={{
            scale: 1.05,
            rotateY: 5,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
          whileTap={{ scale: 0.98 }}
          icon={FiPlus}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full md:w-52"
        >
          Add Expense
        </Button>
      </div>

      {/* Category Summary */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(categoryTotals).map(([category, total]) => (
            <Card
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              key={category}
              className="border-l-4 border-primary-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 capitalize">
                    {category.replace("_", " ")}
                  </p>
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <h3 className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(total)}
                    </h3>
                  )}
                </div>
                <FiPieChart className="w-8 h-8 text-primary-500" />
              </div>
            </Card>
          ))}
        </div>
      )}
      <Card>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={categoryOptions}
            placeholder="Filter by category..."
          />
          <Input
            placeholder="Search by expense name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading && expenses.length === 0 ? (
          <LoadingSpinner size="md" />
        ) : (
          <Table
            columns={columns}
            data={filteredExpenses}
            loading={loading}
            emptyMessage="No expenses found. Add your first expense to get started!"
          />
        )}

        {/* Total Display */}
        {filteredExpenses.length > 0 && (
          <div className="mt-4 flex justify-end">
            <div className="bg-gray-50 px-6 py-3 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Total Expenses:
                </span>
                <span className="text-xl font-bold text-danger-600">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
      <Modal
        isOpen={isViewProofModalOpen}
        onClose={() => {
          setIsViewProofModalOpen(false);
          setSelectedRecord(null);
        }}
        title="Payment Proof"
        size="md"
      >
        {selectedRecord?.proof ? (
          <div className="space-y-4">
            <img
              src={selectedRecord.proof}
              alt="Payment Proof"
              className="w-full h-96 rounded-lg"
            />
            <div className="text-sm text-gray-600">
              <p>
                <strong>Name:</strong> {selectedRecord.expenseName}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {formatCurrency(selectedRecord.amount ?? 0)}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={"Add New Expense"}
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{"Add Expense"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Expense Name"
            required
            value={formData.expenseName}
            onChange={(e) =>
              setFormData({ ...formData, expenseName: e.target.value })
            }
            placeholder="e.g., Office Rent - December"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              options={categoryOptions}
            />

            <Input
              label="Amount (PKR)"
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
            />
          </div>
          <div className="min-w-8">
            <FileUpload
              label="Upload Proof"
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              onChange={handleImageUpload}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional expense details..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </form>
      </Modal>
    </div>
    </motion.div>
  );
};

export default Expenses;
