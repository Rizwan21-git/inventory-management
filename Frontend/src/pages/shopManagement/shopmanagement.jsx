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
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiCopy,
} from "react-icons/fi";
import {
  fetchShops,
  createShop,
  updateShop,
  deleteShop,
  createWorker,
  updateWorker,
  deleteWorker,
  fetchWorkersByShop,
  // updateWorkerPermissions,
  setSelectedShop,
  clearSelectedShop,
  updateWorkerPermissions,
} from "../../slices/shopSlice";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

const ROLES = ["Senior", "Junior", "Manager", "Supervisor", "Trainee"];

const PERMISSIONS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "inventory", label: "Inventory", icon: "📦" },
  { id: "invoices", label: "Invoices", icon: "🧾" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "quotation", label: "Quotation", icon: "📝" },
  { id: "projects", label: "Projects", icon: "🎯" },
  { id: "dropshipping", label: "Dropshipping", icon: "🚚" },
  { id: "investment", label: "Investment", icon: "📈" },
  { id: "expenses", label: "Expenses", icon: "💳" },
];

const ShopManagement = () => {
  const dispatch = useDispatch();

  // Redux selectors
  const { shops, workers, selectedShop, loading, workersLoading, error } =
    useSelector((state) => state.shops);

  // Local UI state only
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showShopPassword, setShowShopPassword] = useState({});
  const [workersSum, setworkersSum] = useState(0);

  // Shop Form Data
  const [shopFormData, setShopFormData] = useState({
    name: "",
    location: "",
    username: "",
    password: "",
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
    permissions: {},
  });

  // Initial load
  useEffect(() => {
    dispatch(fetchShops());
  }, [dispatch]);

  // Initialize permissions object
  const initializePermissions = () => {
    const perms = {};
    PERMISSIONS.forEach((p) => {
      perms[p.id] = false;
    });
    return perms;
  };

  // ========== SHOP HANDLERS ==========

  const handleShopSubmit = async (e) => {
    e.preventDefault();

    if ((!editingShop) && (!shopFormData.username || !shopFormData.password)) {
      toast.error("Username and password are required");
      return;
    }

    try {
      if (editingShop) {
        await dispatch(
          updateShop({
            id: editingShop._id,
            data: shopFormData,
          })
        ).unwrap();
        toast.success("Shop updated successfully!");
      } else {
        await dispatch(createShop(shopFormData)).unwrap();
        toast.success("Shop added successfully!");
      }
      setIsShopModalOpen(false);
      resetShopForm();
      dispatch(fetchShops()); // Refresh list
    } catch (error) {
      toast.error(error || "Operation failed");
    }
  };

  const handleEditShop = (shop) => {
    setEditingShop(shop);
    setShopFormData({
      name: shop.name,
      location: shop.location,
      username: shop.username || "",
      password: shop.password || "",
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
        dispatch(fetchShops()); // Refresh list
      } catch (error) {
        toast.error("Failed to delete shop");
      }
    }
  };

  const resetShopForm = () => {
    setShopFormData({
      name: "",
      location: "",
      username: "",
      password: "",
    });
    setEditingShop(null);
    setShowPassword(false);
  };

  // ========== WORKER HANDLERS ==========

  const handleWorkerSubmit = async (e) => {
    e.preventDefault();

    if (!selectedShop) {
      toast.error("Please select a shop");
      return;
    }

    try {
      const workerData = {
        ...workerFormData,
        shopId: selectedShop._id,
      };

      if (editingWorker) {
        await dispatch(
          updateWorker({
            id: editingWorker._id,
            data: workerData,
          })
        ).unwrap();
        toast.success("Worker updated successfully!");
      } else {
        await dispatch(createWorker(workerData)).unwrap();
        toast.success("Worker added successfully!");
      }
      setIsWorkerModalOpen(false);
      resetWorkerForm();
      dispatch(fetchWorkersByShop(selectedShop._id));
    } catch (error) {
      console.log(error);
      toast.error(error || "Operation failed");
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
      joinDate: worker.joinDate.split("T")[0],
      shopId: worker.shopId._id || worker.shopId,
      permissions: worker.permissions || initializePermissions(),
    });
    setIsWorkerModalOpen(true);
  };

  const handleEditPermissions = (worker) => {
    setEditingWorker(worker);
    setWorkerFormData({
      name: worker.name,
      phone: worker.phone,
      email: worker.email,
      role: worker.role,
      salary: worker.salary,
      joinDate: worker.joinDate.split("T")[0],
      shopId: worker.shopId._id || worker.shopId,
      permissions: worker.permissions || initializePermissions(),
    });
    setIsPermissionsModalOpen(true);
  };

  const handleTogglePermission = (permissionId) => {
    setWorkerFormData({
      ...workerFormData,
      permissions: {
        ...workerFormData.permissions,
        [permissionId]: !workerFormData.permissions[permissionId],
      },
    });
  };

  const handleSavePermissions = async () => {
    if (!editingWorker) {
      toast.error("No worker selected");
      return;
    }

    try {
      await dispatch(
        updateWorkerPermissions({
          id: editingWorker._id,
          permissions: workerFormData.permissions,
        })
      ).unwrap();
      toast.success("Permissions updated successfully!");
      setIsPermissionsModalOpen(false);
      setEditingWorker(null);
      dispatch(fetchWorkersByShop(selectedShop._id)); // Refresh workers list
    } catch (error) {
      toast.error(error || "Failed to update permissions");
    }
  };

  const handleDeleteWorker = async (id) => {
    if (window.confirm("Are you sure you want to remove this worker?")) {
      try {
        await dispatch(deleteWorker(id)).unwrap();
        toast.success("Worker removed successfully!");
        dispatch(fetchWorkersByShop(selectedShop._id)); 
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
      permissions: initializePermissions(),
    });
    setEditingWorker(null);
  };

  const handleViewWorkers = (shop) => {
    dispatch(setSelectedShop(shop));
    dispatch(fetchWorkersByShop(shop._id));
  };

  const handleBackToShops = () => {
    dispatch(clearSelectedShop());
    dispatch(fetchShops());

  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
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

  const getEnabledPermissions = (permissions) => {
    return Object.entries(permissions || {}).filter(([_, enabled]) => enabled)
      .length;
  };

  let workersCount = 0;
  const getWorkerCount = ()=>{
    shops.forEach((shop) =>{
      workersCount += shop.workerCount;
    })
    return workersCount;
  }



  // Statistics
  const stats = [
    {
      label: "Total Shops",
      value: shops?.length || 0,
      icon: FiShoppingBag,
      color: "primary",
    },
    {
      label: "Total Workers",
      value: getWorkerCount(),
      icon: FiUsers,
      color: "success",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            {selectedShop ? (
              <>
                <FiUsers className="text-primary-600" />
                {selectedShop.name} - Workers
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
              ? "Manage workers and assign permissions"
              : "Manage shops and their workforce"}
          </p>
        </div>

        <div className="flex gap-2">
          {selectedShop && (
            <Button
              variant="outline"
              onClick={handleBackToShops}
              className="w-full md:w-auto"
            >
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
            className="w-full md:w-auto"
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

      {/* Shops Grid or Workers Grid */}
      {!selectedShop ? (
        // Shops Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full">
              <LoadingSpinner size="md" />
            </div>
          ) : !shops || shops.length === 0 ? (
            <Card className="col-span-full py-12">
              <div className="text-center text-gray-500">
                No shops found. Add your first shop to get started!
              </div>
            </Card>
          ) : (
            shops.map((shop) => (
              <Card
                key={shop._id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Shop Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {shop.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <FiMapPin className="w-4 h-4" /> {shop.location}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiShoppingBag className="text-primary-600 w-5 h-5" />
                    </div>
                  </div>

                  {/* Credentials */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-900 mb-2">
                      <FiLock className="w-4 h-4" />
                      Shop Credentials
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between bg-white rounded p-2">
                        <span className="text-gray-700 font-mono text-xs">
                          {shop.username}
                        </span>
                        <button
                          onClick={() => copyToClipboard(shop.username)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded p-2">
                        <span className="text-gray-700 font-mono text-xs">
                          {showShopPassword[shop._id]
                            ? "•••••••• (Hidden - For security)"
                            : "••••••••"}
                        </span>
                        <button
                          onClick={() =>
                            setShowShopPassword({
                              ...showShopPassword,
                              [shop._id]: !showShopPassword[shop._id],
                            })
                          }
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="Passwords are hashed in database for security"
                        >
                          {showShopPassword[shop._id] ? (
                            <FiEyeOff className="w-4 h-4" />
                          ) : (
                            <FiEye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Workers Count */}
                  <div className="flex items-center justify-between text-sm border-t pt-4">
                    <span className="text-gray-600">
                      Workers:{" "}
                      <span className="font-semibold">
                        {shop.workerCount || 0}
                      </span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-4">
                    <Button
                      onClick={() => handleViewWorkers(shop)}
                      variant="primary"
                      className="flex-1"
                      size="sm"
                    >
                      View Workers
                    </Button>
                    <button
                      onClick={() => handleEditShop(shop)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteShop(shop._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        // Workers Grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workersLoading ? (
            <div className="col-span-full">
              <LoadingSpinner size="md" />
            </div>
          ) : !workers || workers.length === 0 ? (
            <Card className="col-span-full py-12">
              <div className="text-center text-gray-500">
                No workers found. Add your first worker to get started!
              </div>
            </Card>
          ) : (
            workers.map((worker) => (
              <Card
                key={worker._id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Worker Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {worker.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getRoleBadgeVariant(worker.role)}>
                          {worker.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      {worker.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-gray-400" />
                      {worker.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">💰</span>
                      PKR {Number(worker.salary).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📅</span>
                      {new Date(worker.joinDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Permissions Summary */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Permissions
                      </span>
                      <Badge variant="info">
                        {getEnabledPermissions(worker.permissions)}/
                        {PERMISSIONS.length}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(worker.permissions || {}).map(
                        ([permId, enabled]) => {
                          const perm = PERMISSIONS.find((p) => p.id === permId);
                          return enabled ? (
                            <span
                              key={permId}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              <FiCheck className="w-3 h-3" />
                              {perm?.label}
                            </span>
                          ) : null;
                        }
                      )}
                    </div>
                    {getEnabledPermissions(worker.permissions) === 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        No permissions assigned
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-4">
                    <Button
                      onClick={() => handleEditPermissions(worker)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      Manage Permissions
                    </Button>
                    <button
                      onClick={() => handleEditWorker(worker)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorker(worker._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

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
            <Button onClick={handleShopSubmit} disabled={loading}>
              {loading
                ? "Processing..."
                : editingShop
                ? "Update Shop"
                : "Add Shop"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleShopSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
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
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Shop Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <Input
                label="Username"
                required
                value={shopFormData.username}
                onChange={(e) =>
                  setShopFormData({ ...shopFormData, username: e.target.value })
                }
                placeholder="Enter shop username"
                icon={FiLock}
              />

              <div className="relative">
                <Input
                  label="Password"
                  required={!editingShop}
                  type={showPassword ? "text" : "password"}
                  value={shopFormData.password}
                  onChange={(e) =>
                    setShopFormData({
                      ...shopFormData,
                      password: e.target.value,
                    })
                  }
                  placeholder={
                    editingShop
                      ? "Leave blank if you do not want to update"
                      : "Enter shop password"
                  }
                  icon={FiLock}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
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
            <Button onClick={handleWorkerSubmit} disabled={workersLoading}>
              {workersLoading
                ? "Processing..."
                : editingWorker
                ? "Update Worker"
                : "Add Worker"}
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
                Role
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
              setWorkerFormData({
                ...workerFormData,
                joinDate: e.target.value,
              })
            }
          />
        </form>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setEditingWorker(null);
        }}
        title={`Manage Permissions - ${editingWorker?.name || ""}`}
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsPermissionsModalOpen(false);
                setEditingWorker(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} disabled={workersLoading}>
              {workersLoading ? "Saving..." : "Save Permissions"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Select which modules this worker can access:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PERMISSIONS.map((permission) => (
              <label
                key={permission.id}
                className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  checked={workerFormData.permissions[permission.id] || false}
                  onChange={() => handleTogglePermission(permission.id)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <span className="flex items-center gap-2 ml-3">
                  <span className="text-lg">{permission.icon}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {permission.label}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShopManagement;