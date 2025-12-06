import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiPackage,
  FiX,
  FiThumbsUp,
  FiBriefcase,
  FiAlertCircle,
  FiSearch,
  FiDollarSign,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
} from "../../slices/projectSlice";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";
import { formatDate, formatCurrency } from "../../utils/helpers";

const Projects = () => {
  const dispatch = useDispatch();
  const { projects, loading, currentPage, totalPages, totalItems } =
    useSelector((state) => state.project);

  // const [projects] = useState([]);

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    projectName: "",
    siteLocation: "",
    customerName: "",
    customerPhone: "",
    customerRequirements: "",
    workerAssigned: "",
    status: "in_progress",
    customerLabourCost: 0,
    workerPayment: 0,
  });
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(fetchProjects({ page: currentPage }));
  }, [dispatch, currentPage]);

  //profit caculate
  const calculateProfit = (customerCost, workerPay) => {
    return parseFloat(customerCost || 0) - parseFloat(workerPay || 0);
  };

  const profit = calculateProfit(
    formData.customerLabourCost,
    formData.workerPayment
  );

  // Derived summaries from loaded data
  const totalCount = projects?.length ?? 0;
  const counts = {
    pending: 0,
    in_progress: 0,
  };

  let totalProfit = 0;
  (projects || []).forEach((p) => {
    const s = p.status;
    if (counts[s] !== undefined) counts[s] += 1;
    totalProfit += p.profit;
  });

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!formData.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      const projectData = {
        ...formData,
        profit: parseFloat(formData.customerLabourCost || 0) - parseFloat(formData.workerPayment || 0),
      };
      console.log(projectData);
      await dispatch(createProject(projectData)).unwrap();
      toast.success("Project created successfully!");
      // setIsModalOpen(false);
      // resetForm();
    } catch (error) {
      toast.error(error?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await dispatch(deleteProject(id)).unwrap();
        toast.success("Project deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await dispatch(
        updateProjectStatus({ id, data: { status: newStatus } })
      ).unwrap();
      toast.success("Status updated successfully!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      siteLocation: "",
      customerName: "",
      customerPhone: "",
      customerRequirements: "",
      workerAssigned: "",
      status: "in_progress",
      customerLabourCost: 0,
      workerPayment: 0,
      profit: 0,
    });
    setEditingProject(null);
  };

  // Columns for the table
  const columns = [
    { header: "Project Name", accessor: "projectName" },
    { header: "Site Location", accessor: "siteLocation" },
    { header: "Customer", accessor: "customerName" },
    {
      header: "Worker",
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiUser className="w-4 h-4 text-gray-400" />
          <span>{row.workerAssigned || "Unassigned"}</span>
        </div>
      ),
    },
    {
      header: "Customer Labour Cost",
      render: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.customerLabourCost || 0)}
        </span>
      ),
    },
    {
      header: "Worker Payment",
      render: (row) => (
        <span className="font-semibold text-gray-700">
          {formatCurrency(row.workerPayment || 0)}
        </span>
      ),
    },
    {
      header: "Profit",
      render: (row) => {
        const projectProfit = calculateProfit(
          row.customerLabourCost,
          row.workerPayment
        );
        const isProfit = projectProfit >= 0;
        return (
          <span
            className={`font-bold ${
              isProfit ? "text-success-600" : "text-danger-600"
            }`}
          >
            {formatCurrency(projectProfit)}
          </span>
        );
      },
    },
    {
      header: "Status",
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
        >
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDelete(row._id)}
            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </motion.button>
        </div>
      ),
    },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  // Client-side filter by status
  const filteredProjects = statusFilter
    ? (projects || []).filter((p) => p.status === statusFilter)
    : projects;

  // Apply modal controls
  const onNewProject = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Derived totals for UI
  const totalInProgress = counts.in_progress;

  const stats = [
    {
      title: "Total Projects",
      value: totalCount,
      color: "bg-gray-600",
      icon: FiPackage,
    },
    {
      title: "In Progress",
      value: totalInProgress,
      color: "bg-blue-500",
      icon: FiBriefcase,
    },
    {
      title: "Total Profit",
      value: formatCurrency(totalProfit),
      color: totalProfit >= 0 ? "bg-emerald-600" : "bg-red-600",
      icon: FiDollarSign,
      isValue: true,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="projects-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FiPackage className="text-primary-600" />
              Project Management
            </h1>
            <p className="text-gray-600 mt-1">
              Track projects, workers, costs, and profits
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              icon={FiPlus}
              onClick={onNewProject}
              className="w-full md:w-52"
            >
              New Project
            </Button>
          </motion.div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {stats.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
              className="cursor-default"
            >
              <Card className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {card.title}
                    </p>
                    <h3
                      className={`text-2xl font-bold mt-2 ${
                        card.isValue ? "text-primary-600" : "text-gray-900"
                      }`}
                    >
                      {card.value ?? 0}
                    </h3>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 w-full h-1 ${card.color}`}
                />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:min-w-0">
                <Input
                  placeholder="Search projects..."
                  icon={FiSearch}
                  onChange={(e) => {
                    /* wire search functionality if needed */
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                className="w-full md:w-48"
              />
            </div>
          </Card>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            {loading && projects?.length === 0 ? (
              <LoadingSpinner size="md" />
            ) : (
              <Table
                columns={columns}
                data={filteredProjects || []}
                loading={loading}
                emptyMessage="No projects found. Create your first project to get started!"
              />
            )}
          </Card>
        </motion.div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingProject ? "Edit Project" : "Create New Project"}
          size="xl"
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
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            {/* Project Basic Info */}
            <div className="border-b ">
              <div className="grid mb-2 grid-cols-1 lg:grid-cols-4 md:grid-cols-4 gap-2">
                <Input
                  label="Project Name"
                  required
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  placeholder="Kitchen Renovation, Flooring, etc."
                />
                <Input
                  label="Site Location"
                  required
                  value={formData.siteLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, siteLocation: e.target.value })
                  }
                  placeholder="Full address of the site"
                  // className="mt-4"
                />
                <Input
                  label="Customer Name"
                  required
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Full name"
                />
                <Input
                  label="Customer Phone"
                  required
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="+92-3XXXXXXXX"
                />
              </div>
            </div>

            {/* Customer Information */}
            <div className="border-b pb-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                <Input
                  label="Worker Assigned"
                  value={formData.workerAssigned}
                  onChange={(e) =>
                    setFormData({ ...formData, workerAssigned: e.target.value })
                  }
                  placeholder="Worker name"
                />
                <textarea
                  value={formData.customerRequirements}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerRequirements: e.target.value,
                    })
                  }
                  placeholder="Describe all customer requirements and specifications..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Pricing Information */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Pricing & Costs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Customer Labour Cost (سامان کے علاوہ)"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.customerLabourCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerLabourCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Amount received from customer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total labour cost charged to customer (excluding materials)
                  </p>
                </div>
                <div>
                  <Input
                    label="Worker Payment (کام کی مزدوری)"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.workerPayment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workerPayment: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Amount paid to worker"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total labour payment given to worker
                  </p>
                </div>
              </div>

              {/* Profit Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-4 p-4 rounded-lg border-2 ${
                  profit >= 0
                    ? "bg-success-50 border-success-200"
                    : "bg-danger-50 border-danger-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        profit >= 0 ? "text-success-700" : "text-danger-700"
                      }`}
                    >
                      Profit Calculation
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatCurrency(formData.customerLabourCost)} -{" "}
                      {formatCurrency(formData.workerPayment)} ={" "}
                      <span
                        className={`font-bold ${
                          profit >= 0 ? "text-success-600" : "text-danger-600"
                        }`}
                      >
                        {formatCurrency(profit)}
                      </span>
                    </p>
                  </div>
                  <div
                    className={`text-3xl font-bold ${
                      profit >= 0 ? "text-success-600" : "text-danger-600"
                    }`}
                  >
                    {formatCurrency(profit)}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Project Timeline & Assignment */}
            <div className="border-b pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"></div>
            </div>
          </form>
        </Modal>
      </motion.div>
    </AnimatePresence>
  );
};

export default Projects;
