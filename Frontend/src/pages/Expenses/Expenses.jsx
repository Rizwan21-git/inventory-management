import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPieChart,
  FiPackage,
} from "react-icons/fi";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
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
import {
  formatCurrency,
  formatDate,
  formatPaymentMethodLabel,
} from "../../utils/helpers";

const Expenses = () => {
  const dispatch = useDispatch();
  const { expenses, loading, totalItems } =
    useSelector((state) => state.expense);
    console.log(expenses);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    expenseName: "",
    category: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T"),
    paymentMethod: "",
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
      expense.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatCurrency(expense.amount).includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await dispatch(
          updateExpense({ id: editingExpense.id, data: formData })
        ).unwrap();
        toast.success("Expense updated successfully!");
      } else {
        await dispatch(createExpense(formData)).unwrap();
        toast.success("Expense added successfully!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error?.message || "Operation failed");
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      expenseName: expense.expenseName,
      category: expense.category,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || "",
    });
    setIsModalOpen(true);
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

  const resetForm = () => {
    setFormData({
      expenseName: "",
      category: "",
      amount: "",
      expenseDate: new Date().toISOString().split("T"),
      paymentMethod: "",
      notes: "",
    });
    setEditingExpense(null);
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
      header: "Payment Method",
      render: (row) => (
        <span className="capitalize">
          {formatPaymentMethodLabel(row.paymentMethod)}
        </span>
      ),
    },
    {
      header: "Date",
      render: (row) => formatDate(row.expenseDate),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
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

  // if (loading && expenses.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <div className="flex items-center justify-between">
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
            placeholder="Search by expense name or payment method..."
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
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingExpense ? "Edit Expense" : "Add New Expense"}
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
            <Button onClick={handleSubmit}>
              {editingExpense ? "Update Expense" : "Add Expense"}
            </Button>
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expense Date"
              type="date"
              required
              value={formData.expenseDate}
              onChange={(e) =>
                setFormData({ ...formData, expenseDate: e.target.value })
              }
            />

            <Select
              label="Payment Method"
              required
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              options={[
                { value: "cash", label: "Cash" },
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "card", label: "Card" },
                { value: "cheque", label: "Cheque" },
              ]}
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
  );
};

export default Expenses;
