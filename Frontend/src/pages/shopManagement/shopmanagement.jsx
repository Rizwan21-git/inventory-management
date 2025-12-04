import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiMapPin,
  FiPhone,
  FiMail,
  FiShoppingBag,
} from "react-icons/fi";
import {
  fetchShops,
  createShop,
  updateShop,
  deleteShop,
  fetchWorkersByShop,
  createWorker,
  updateWorker,
  deleteWorker,
  setSelectedShop,
  clearSelectedShop,
} from "../../slices/shopSlice";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";
// import { ITEMS_PER_PAGE } from "../../utils/constants";

const ROLES = ["Senior", "Junior", "Manager", "Supervisor", "Trainee"];

const ShopManagement = () => {
  const dispatch = useDispatch();
  const {
    // shops,
    // workers,
    selectedShop,
    loading,
    workersLoading,
    totalItems,
    workersTotalItems,
  } = useSelector((state) => state.shops);
  const [shops, setShops] = useState([])
  const [workers, setWorkers] = useState([])

  // Modal States
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);

  // Shop Form Data
  const [shopFormData, setShopFormData] = useState({
    name: "",
    location: "",
    phone: "",
    email: "",
    manager: "",
  });

  // Worker Form Data
  const [workerFormData, setWorkerFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "Junior",
    salary: "",
    joinDate: new Date().toISOString().split("T")[0],
    shopId: "",
  });

  useEffect(() => {
    dispatch(fetchShops());
  }, [dispatch]);

  useEffect(() => {
    if (selectedShop) {
      dispatch(
        fetchWorkersByShop({ shopId: selectedShop.id })
      );
    }
  }, [dispatch, selectedShop]);

  // Shop Handlers
  const handleShopSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShop) {
        await dispatch(
          updateShop({ id: editingShop.id, data: shopFormData })
        ).unwrap();
        toast.success("Shop updated successfully!");
      } else {
        shops.push(shopFormData);
        console.log(shopFormData);
        // await dispatch(createShop(shopFormData)).unwrap();
        // toast.success("Shop added successfully!");
      }
      setIsShopModalOpen(false);
      resetShopForm();
    } catch (error) {
      toast.error(error?.message || "Operation failed");
    }
  };

  const handleEditShop = (shop) => {
    setEditingShop(shop);
    setShopFormData({
      name: shop.name,
      location: shop.location,
      phone: shop.phone,
      email: shop.email,
      manager: shop.manager || "",
    });
    setIsShopModalOpen(true);
  };

  const handleDeleteShop = async (id) => {
    if (
      window.confirm(
        "Are you sure? This will also remove all workers from this shop."
      )
    ) {
      try {
        await dispatch(deleteShop(id)).unwrap();
        toast.success("Shop deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete shop");
      }
    }
  };

  const resetShopForm = () => {
    setShopFormData({
      name: "",
      location: "",
      phone: "",
      email: "",
      manager: "",
    });
    setEditingShop(null);
  };

  // Worker Handlers
  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    try {
      const workerData = {
        ...workerFormData,
        shopId: selectedShop.id,
      };

      if (editingWorker) {
        await dispatch(
          updateWorker({ id: editingWorker.id, data: workerData })
        ).unwrap();
        toast.success("Worker updated successfully!");
      } else {
        workers.push(workerData);
        console.log(workerData);
        // await dispatch(createWorker(workerData)).unwrap();
        // toast.success("Worker added successfully!");
      }
      setIsWorkerModalOpen(false);
      resetWorkerForm();
    } catch (error) {
      toast.error(error?.message || "Operation failed");
    }
  };

  const handleEditWorker = (worker) => {
    setEditingWorker(worker);
    setWorkerFormData({
      name: worker.name,
      phone: worker.phone,
      email: worker.email,
      role: worker.role,
      salary: worker.salary,
      joinDate: worker.joinDate,
      shopId: worker.shopId,
    });
    setIsWorkerModalOpen(true);
  };

  const handleDeleteWorker = async (id) => {
    if (window.confirm("Are you sure you want to remove this worker?")) {
      try {
        await dispatch(deleteWorker(id)).unwrap();
        toast.success("Worker removed successfully!");
      } catch (error) {
        toast.error("Failed to remove worker");
      }
    }
  };

  const resetWorkerForm = () => {
    setWorkerFormData({
      name: "",
      phone: "",
      email: "",
      role: "Junior",
      salary: "",
      joinDate: new Date().toISOString().split("T")[0],
      shopId: "",
    });
    setEditingWorker(null);
  };

  const handleViewWorkers = (shop) => {
    dispatch(setSelectedShop(shop));
  };

  const handleBackToShops = () => {
    dispatch(clearSelectedShop());
  };

  // Role Badge Variants
  const getRoleBadgeVariant = (role) => {
    switch (role.toLowerCase()) {
      case "senior":
        return "success";
      case "manager":
        return "primary";
      case "supervisor":
        return "info";
      case "junior":
        return "warning";
      case "trainee":
        return "secondary";
      default:
        return "default";
    }
  };

  // Shop Columns
  const shopColumns = [
    {
      header: "Shop Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <FiShoppingBag className="text-primary-600 w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-700">
          <FiMapPin className="w-4 h-4 text-gray-400" />
          {row.location}
        </div>
      ),
    },
    {
      header: "Phone",
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-700">
          <FiPhone className="w-4 h-4 text-gray-400" />
          {row.phone}
        </div>
      ),
    },
    {
      header: "Manager",
      render: (row) =>
        row.manager || <span className="text-gray-400">N/A</span>,
    },
    {
      header: "Workers",
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {row.workerCount || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewWorkers(row)}
            className="px-3 py-1.5 text-sm bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors font-medium"
          >
            View Workers
          </button>
          <button
            onClick={() => handleEditShop(row)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteShop(row.id)}
            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Worker Columns
  const workerColumns = [
    {
      header: "Worker Name",
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: "Phone",
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-700">
          <FiPhone className="w-4 h-4 text-gray-400" />
          {row.phone}
        </div>
      ),
    },
    {
      header: "Role",
      render: (row) => (
        <Badge variant={getRoleBadgeVariant(row.role)}>{row.role}</Badge>
      ),
    },
    {
      header: "Salary",
      render: (row) => (
        <span className="font-semibold text-gray-900">
          PKR {Number(row.salary).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Join Date",
      render: (row) => new Date(row.joinDate).toLocaleDateString(),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditWorker(row)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteWorker(row.id)}
            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Statistics Cards
  const stats = [
    {
      label: "Total Shops",
      value: totalItems,
      icon: FiShoppingBag,
      color: "primary",
    },
    {
      label: "Total Workers",
      value: shops.reduce((sum, shop) => sum + (shop.workerCount || 0), 0),
      icon: FiUsers,
      color: "success",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            {selectedShop ? (
              <>
                <FiUsers className="text-primary-600" />
                Workers at {selectedShop.name}
              </>
            ) : (
              <>
                <FiShoppingBag className="text-primary-600" />
                Shop Management
              </>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            {selectedShop
              ? "Manage workers and their roles"
              : "Manage shops and their workforce"}
          </p>
        </div>

        <div className="flex gap-2">
          {selectedShop && (
            <Button variant="outline" onClick={handleBackToShops}>
              Back to Shops
            </Button>
          )}
          <Button
            icon={FiPlus}
            onClick={() => {
              if (selectedShop) {
                resetWorkerForm();
                setIsWorkerModalOpen(true);
              } else {
                resetShopForm();
                setIsShopModalOpen(true);
              }
            }}
          >
            {selectedShop ? "Add Worker" : "Add Shop"}
          </Button>
        </div>
      </div>

      {/* Statistics - Only show when viewing shops */}
      {!selectedShop && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Card>
        {selectedShop ? (
          // Workers Table
          <>
            {workersLoading && workers.length === 0 ? (
              <LoadingSpinner size="md" />
            ) : (
              <Table
                columns={workerColumns}
                data={workers}
                loading={workersLoading}
                emptyMessage="No workers found. Add your first worker to get started!"
              />
            )}
          </>
        ) : (
          // Shops Table
          <>
            {loading && shops.length === 0 ? (
              <LoadingSpinner size="md" />
            ) : (
              <Table
                columns={shopColumns}
                data={shops}
                loading={loading}
                emptyMessage="No shops found. Add your first shop to get started!"
              />
            )}
          </>
        )}
      </Card>

      {/* Shop Modal */}
      <Modal
        isOpen={isShopModalOpen}
        onClose={() => {
          setIsShopModalOpen(false);
          resetShopForm();
        }}
        title={editingShop ? "Edit Shop" : "Add New Shop"}
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsShopModalOpen(false);
                resetShopForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleShopSubmit}>
              {editingShop ? "Update Shop" : "Add Shop"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleShopSubmit} className="space-y-4">
          <Input
            label="Shop Name"
            required
            value={shopFormData.name}
            onChange={(e) =>
              setShopFormData({ ...shopFormData, name: e.target.value })
            }
            placeholder="Enter shop name"
            icon={FiShoppingBag}
          />

          <Input
            label="Location"
            required
            value={shopFormData.location}
            onChange={(e) =>
              setShopFormData({ ...shopFormData, location: e.target.value })
            }
            placeholder="Shop address"
            icon={FiMapPin}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              required
              value={shopFormData.phone}
              onChange={(e) =>
                setShopFormData({ ...shopFormData, phone: e.target.value })
              }
              placeholder="+92 300 1234567"
              icon={FiPhone}
            />

            <Input
              label="Email"
              type="email"
              required
              value={shopFormData.email}
              onChange={(e) =>
                setShopFormData({ ...shopFormData, email: e.target.value })
              }
              placeholder="shop@example.com"
              icon={FiMail}
            />
          </div>

          <Input
            label="Manager Name (Optional)"
            value={shopFormData.manager}
            onChange={(e) =>
              setShopFormData({ ...shopFormData, manager: e.target.value })
            }
            placeholder="Manager's full name"
          />
        </form>
      </Modal>

      {/* Worker Modal */}
      <Modal
        isOpen={isWorkerModalOpen}
        onClose={() => {
          setIsWorkerModalOpen(false);
          resetWorkerForm();
        }}
        title={editingWorker ? "Edit Worker" : "Add New Worker"}
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsWorkerModalOpen(false);
                resetWorkerForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleWorkerSubmit}>
              {editingWorker ? "Update Worker" : "Add Worker"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleWorkerSubmit} className="space-y-4">
          <Input
            label="Worker Name"
            required
            value={workerFormData.name}
            onChange={(e) =>
              setWorkerFormData({ ...workerFormData, name: e.target.value })
            }
            placeholder="Full name"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              required
              value={workerFormData.phone}
              onChange={(e) =>
                setWorkerFormData({ ...workerFormData, phone: e.target.value })
              }
              placeholder="+92 300 1234567"
              icon={FiPhone}
            />

            <Input
              label="Email"
              type="email"
              required
              value={workerFormData.email}
              onChange={(e) =>
                setWorkerFormData({ ...workerFormData, email: e.target.value })
              }
              placeholder="worker@example.com"
              icon={FiMail}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role / Tag
              </label>
              <select
                required
                value={workerFormData.role}
                onChange={(e) =>
                  setWorkerFormData({ ...workerFormData, role: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Salary (PKR)"
              type="number"
              required
              min="0"
              step="1000"
              value={workerFormData.salary}
              onChange={(e) =>
                setWorkerFormData({ ...workerFormData, salary: e.target.value })
              }
              placeholder="50000"
            />
          </div>

          <Input
            label="Join Date"
            type="date"
            required
            value={workerFormData.joinDate}
            onChange={(e) =>
              setWorkerFormData({ ...workerFormData, joinDate: e.target.value })
            }
          />
        </form>
      </Modal>
    </div>
  );
};

export default ShopManagement;
