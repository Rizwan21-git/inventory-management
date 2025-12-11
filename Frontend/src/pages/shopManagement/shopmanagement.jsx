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
  setSelectedShop,
  clearSelectedShop,
} from "../../slices/shopSlice";
import {
  fetchAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../slices/adminSlice";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

const ShopManagement = () => {
  const dispatch = useDispatch();

  // Redux selectors
  const { shops, workers, selectedShop, loading, workersLoading, error } =
    useSelector((state) => state.shops);
  const { admins, loading: adminsLoading } = useSelector(
    (state) => state.admins
  );

  // Local UI state only
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showShopPassword, setShowShopPassword] = useState({});
  const [showAdminPassword, setShowAdminPassword] = useState({});
  const [activeTab, setActiveTab] = useState("shops"); // 'shops' or 'admins'

  // Shop Form Data
  const [shopFormData, setShopFormData] = useState({
    name: "",
    location: "",
    username: "",
    password: "",
  });

  // Worker Form Data (simplified - no role or permissions)
  const [workerFormData, setWorkerFormData] = useState({
    name: "",
    phone: "",
    email: "",
    salary: "",
    joinDate: new Date().toISOString().split("T")[0],
    shopId: "",
  });

  // Admin Form Data
  const [adminFormData, setAdminFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "Admin",
  });


  // Initial load
  useEffect(() => {
    dispatch(fetchShops());
    dispatch(fetchAdmins());
  }, [dispatch]);

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
      password: "", // Leave password empty for edit - only update if user enters new one
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
      toast.error(error || "Operation failed");
    }
  };

  const handleEditWorker = (worker) => {
    setEditingWorker(worker);
    setWorkerFormData({
      name: worker.name,
      phone: worker.phone,
      email: worker.email,
      salary: worker.salary,
      joinDate: worker.joinDate.split("T")[0],
      shopId: worker.shopId._id || worker.shopId,
    });
    setIsWorkerModalOpen(true);
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
      salary: "",
      joinDate: new Date().toISOString().split("T")[0],
      shopId: "",
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

  // ========== ADMIN HANDLERS ==========

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    if (!editingAdmin && (!adminFormData.username || !adminFormData.password)) {
      toast.error("Username and password are required");
      return;
    }

    try {
      if (editingAdmin) {
        await dispatch(
          updateAdmin({
            id: editingAdmin._id,
            data: adminFormData,
          })
        ).unwrap();
        toast.success("Admin updated successfully!");
      } else {
        await dispatch(createAdmin(adminFormData)).unwrap();
        toast.success("Admin added successfully!");
      }
      setIsAdminModalOpen(false);
      resetAdminForm();
    } catch (error) {
      toast.error(error || "Operation failed");
    }
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setAdminFormData({
      name: admin.name,
      username: admin.username,
      email: admin.email,
      password: "",
      role: admin.role,
    });
    setIsAdminModalOpen(true);
  };

  const handleDeleteAdmin = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await dispatch(deleteAdmin(id)).unwrap();
        toast.success("Admin deleted successfully!");
      } catch (error) {
        toast.error(error || "Failed to delete admin");
      }
    }
  };

  const resetAdminForm = () => {
    setAdminFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      role: "Admin",
    });
    setEditingAdmin(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
    {
      label: "Total Admins",
      value: admins?.length || 0,
      icon: FiLock,
      color: "warning",
    },
  ];

  return (
    <div>
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            {selectedShop ? (
              <>
                <FiUsers className="text-primary-600" />
                {selectedShop.name} - Workers
              </>
            ) : activeTab === "shops" ? (
              <>
                <FiShoppingBag className="text-primary-600" />
                Shop Management
              </>
            ) : (
              <>
                <FiLock className="text-primary-600" />
                Admin Management
              </>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            {selectedShop
              ? "Manage workers"
              : activeTab === "shops"
              ? "Manage shops and their workforce"
              : "Manage system administrators"}
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
          {!selectedShop && (
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab("shops")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "shops"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiShoppingBag className="inline mr-2 w-4 h-4" />
                Shops
              </button>
              <button
                onClick={() => setActiveTab("admins")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "admins"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiLock className="inline mr-2 w-4 h-4" />
                Admins
              </button>
            </div>
          )}
          <Button
            icon={FiPlus}
            onClick={() => {
              if (selectedShop) {
                resetWorkerForm();
                setIsWorkerModalOpen(true);
              } else if (activeTab === "shops") {
                resetShopForm();
                setIsShopModalOpen(true);
              } else {
                resetAdminForm();
                setIsAdminModalOpen(true);
              }
            }}
            className="w-full md:w-auto"
          >
            {selectedShop
              ? "Add Worker"
              : activeTab === "shops"
              ? "Add Shop"
              : "Add Admin"}
          </Button>
        </div>
      </div>

      {/* Statistics - Only show when viewing shops */}
      {!selectedShop && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

      {/* Shops Grid, Workers Grid, or Admins Grid */}
      {!selectedShop && activeTab === "shops" ? (
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
                      loading={loading}
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
      ) : !selectedShop && activeTab === "admins" ? (
        // Admins Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!admins || admins.length === 0 ? (
            <Card className="col-span-full py-12">
              <div className="text-center text-gray-500">
                No admins found. Add your first admin to get started!
              </div>
            </Card>
          ) : (
            admins.map((admin) => (
              <Card
                key={admin._id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Admin Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {admin.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{admin.role}</p>
                    </div>
                  </div>

                  {/* Admin Credentials */}
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-900 mb-2">
                      <FiLock className="w-4 h-4" />
                      Admin Credentials
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Username</p>
                        <div className="flex items-center justify-between bg-white rounded p-2">
                          <span className="text-gray-700 font-mono text-xs">
                            {admin.username}
                          </span>
                          <button
                            onClick={() => copyToClipboard(admin.username)}
                            className="text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <div className="flex items-center justify-between bg-white rounded p-2">
                          <span className="text-gray-700 font-mono text-xs">
                            {admin.email}
                          </span>
                          <button
                            onClick={() => copyToClipboard(admin.email)}
                            className="text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Password</p>
                        <div className="flex items-center justify-between bg-white rounded p-2">
                          <span className="text-gray-700 font-mono text-xs">
                            {showAdminPassword[admin._id]
                              ? admin.password
                              : "••••••••"}
                          </span>
                          <button
                            onClick={() =>
                              setShowAdminPassword({
                                ...showAdminPassword,
                                [admin._id]: !showAdminPassword[admin._id],
                              })
                            }
                            className="text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            {showAdminPassword[admin._id] ? (
                              <FiEyeOff className="w-4 h-4" />
                            ) : (
                              <FiEye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => handleEditAdmin(admin)}
                      className="flex-1 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4 inline mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin._id)}
                      className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 inline mr-2" /> Delete
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

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => handleEditWorker(worker)}
                      className="flex-1 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4 inline mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWorker(worker._id)}
                      className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 inline mr-2" /> Delete
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
            <Button
              onClick={handleShopSubmit}
              loading={loading}
              disabled={loading}
            >
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
            <Button
              onClick={handleWorkerSubmit}
              loading={loading}
              disabled={workersLoading}
            >
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

      {/* Admin Modal */}
      <Modal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          resetAdminForm();
        }}
        title={editingAdmin ? "Edit Admin" : "Add New Admin"}
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdminModalOpen(false);
                resetAdminForm();
              }}
            >
              Cancel
            </Button>
            <Button loading={loading} onClick={handleAdminSubmit}>
              {editingAdmin ? "Update Admin" : "Add Admin"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdminSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <Input
              label="Admin Name"
              required
              value={adminFormData.name}
              onChange={(e) =>
                setAdminFormData({ ...adminFormData, name: e.target.value })
              }
              placeholder="Enter admin name"
            />

            <Input
              label="Email"
              type="email"
              required
              value={adminFormData.email}
              onChange={(e) =>
                setAdminFormData({ ...adminFormData, email: e.target.value })
              }
              placeholder="admin@example.com"
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Admin Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <Input
                label="Username"
                required
                value={adminFormData.username}
                onChange={(e) =>
                  setAdminFormData({
                    ...adminFormData,
                    username: e.target.value,
                  })
                }
                placeholder="Enter admin username"
                icon={FiLock}
              />

              <div className="relative">
                <Input
                  label="Password"
                  required={!editingAdmin}
                  type={showPassword ? "text" : "password"}
                  value={adminFormData.password}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      password: e.target.value,
                    })
                  }
                  placeholder={
                    editingAdmin
                      ? "Leave blank if you do not want to update"
                      : "Enter admin password"
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
    </div>
  );
};

export default ShopManagement;