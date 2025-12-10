import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiAlertCircle,
  FiImage,
  FiX,
} from "react-icons/fi";
import {
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../../slices/inventorySlice";
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
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "../../utils/constants";
import { debounce, formatCurrency } from "../../utils/helpers";

const Inventory = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { items, loading } = useSelector((state) => state.inventory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    buyingPrice: "",
    sellingPrice: "",
    condition: "new",
    notes: "",
    selectedSize: "",
    // image: null,
    sizes: [],
  });

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("category");
    const showLowStock = params.get("show") === "low_stock";

    if (categoryFromUrl) {
      setFilterCategory(categoryFromUrl);
      toast.success(`Filtered by: ${categoryFromUrl.replace("_", " ")}`);
    }

    if (showLowStock) {
      setShowLowStockOnly(true);
      toast.success("Showing low stock items");
    }
  }, [location.search]);

  // Fetch inventory
  useEffect(() => {
    dispatch(fetchInventory({}));
  }, [dispatch]);

  const handleSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  // Handle image upload
  // const handleImageUpload = (files) => {
  //   if (files && files.length > 0) {
  //     const file = files[0];
  //     setImageFile(file);

  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       setPreviewImage(e.target.result);
  //       setFormData({ ...formData, image: e.target.result });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // Calculate profit margin
  const calculateMargin = () => {
    const buying = Number(formData.buyingPrice) || 0;
    const selling = Number(formData.sellingPrice) || 0;
    if (buying === 0) return 0;
    return Number((((selling - buying) / buying) * 100).toFixed(2));
  };

  // Size variant functions
  const addSizeVariant = () => {
    setFormData({
      ...formData,
      sizes: [{ width: "", length: "" }, ...formData.sizes],
    });
  };

  const removeSizeVariant = (index) => {
    const newVariants = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newVariants });
  };

  const updateSizeVariant = (index, field, value) => {
    const newVariants = [...formData.sizes];
    newVariants[index][field] = value;
    setFormData({ ...formData, sizes: newVariants });
  };

  // Check if any size variants are added
  const hassizes = formData.sizes.length > 0;

  // Filter logic - centralized and clean
  const getFilteredItems = () => {
    return items?.filter((item) => {
      // Search by product name
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by category
      const matchesCategory =
        !filterCategory || item.category === filterCategory;

      // Filter by stock level (low stock = less than 10)
      const matchesStockFilter = !showLowStockOnly || item.quantity < 10;
      return matchesSearch && matchesCategory && matchesStockFilter;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (Number(formData.quantity) < 0) {
      toast.error("Quantity could not be negative");
      return;
    }
    if (Number(formData.buyingPrice) <= 0) {
      toast.error(
        `${
          hassizes ? "Rate per square feet" : "Buying price"
        } must be greater than 0`
      );
      return;
    }
    if (!hassizes && Number(formData.sellingPrice) <= 0) {
      toast.error("Selling price must be greater than 0");
      return;
    }

    // Validate size variants if any
    if (hassizes) {
      for (let i = 0; i < formData.sizes.length; i++) {
        const variant = formData.sizes[i];
        if (!variant.width || !variant.length) {
          toast.error(
            `Please fill both width and length for size variant ${i + 1}`
          );
          return;
        }
        if (Number(variant.width) <= 0 || Number(variant.length) <= 0) {
          toast.error(
            `Width and length must be greater than 0 for size variant ${i + 1}`
          );
          return;
        }
      }
    }

    try {
      const itemData = {
        ...formData,
        buyingPrice: Number(formData.buyingPrice),
        sellingPrice: Number(formData.sellingPrice),
        quantity: Number(formData.quantity),
        profitMargin: calculateMargin(),
        sizes: formData.sizes.map((v) => ({
          width: Number(v.width),
          length: Number(v.length),
        })),
      };

      if (editingItem) {
        await dispatch(
          updateInventoryItem({ id: editingItem._id, data: itemData })
        ).unwrap();
        toast.success("Item updated successfully!");
      } else {
        await dispatch(createInventoryItem(itemData)).unwrap();
        toast.success("Item added successfully!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error?.message || "Operation failed");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      buyingPrice: item.buyingPrice,
      sellingPrice: item.sellingPrice,
      condition: item.condition,
      notes: item.notes || "",
      selectedSize: item.selectedSize || "",
      // image: item.image || null,
      sizes: item.sizes || [],
    });
    if (item.image) {
      setPreviewImage(item.image);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await dispatch(deleteInventoryItem(id)).unwrap();
        toast.success("Item deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete item");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: "",
      buyingPrice: "",
      sellingPrice: "",
      condition: "new",
      // image: null,
      sizes: [],
    });
    setPreviewImage(null);
    setImageFile(null);
    setEditingItem(null);
  };

  const getStockBadge = (quantity) => {
    if (quantity === 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (quantity < 10) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  // Get filtered items
  const filteredItems = getFilteredItems();
  
  // Stats calculations using filtered data
  const totalItems = items?.length;
  const lowStockCount = items?.filter(
    (item) => item.quantity < 10 && item.quantity > 0
  ).length;
  const outOfStockCount = items?.filter((item) => item.quantity === 0).length;

  // Table columns
  const columns = [
    {
      header: "Product",
      accessor: "name",
      render: (row) => (
        <div className="flex flex-col items-center gap-1 min-w-[110px]">
          {/* {row.image && (
            <img
              src={row.image}
              alt={row.name}
              className="w-24 h-24 rounded object-cover border border-gray-200 mb-1"
            />
          )} */}
          <span className="font-semibold text-gray-900 text-center">
            {row.name}
          </span>
        </div>
      ),
    },

    {
      header: "Category",
      render: (row) => (
        <span>{row.category.toUpperCase().replace("_", " ")}</span>
      ),
    },
    {
      header: "Quantity",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={
              row.quantity < 10 && row.quantity > 0
                ? "text-danger-600 font-semibold"
                : row.quantity === 0 && "text-danger-800 font-semibold"
            }
          >
            {row.quantity}
          </span>
          {getStockBadge(row.quantity)}
        </div>
      ),
    },
    {
      header: "Buying Price",
      render: (row) => formatCurrency(row.buyingPrice),
    },
    {
      header: "Selling Price",
      render: (row) => formatCurrency(row.sellingPrice),
    },
    {
      header: "Profit Margin",
      render: (row) => (
        <>
          {row.profitMargin < 0 ? (
            <span className="font-semibold text-danger-600">
              {row.profitMargin}%
            </span>
          ) : (
            <span className="font-semibold text-success-600">
              {row.profitMargin}%
            </span>
          )}
        </>
      ),
    },
    {
      header: "Condition",
      render: (row) => (
        <Badge variant={row.condition === "new" ? "success" : "warning"}>
          {row.condition.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Sizes width/length",
      render: (row) =>
        Array.isArray(row.sizes) && row.sizes.length > 0 ? (
          <div className="flex flex-col gap-1">
            {row.sizes.map((sz, idx) => (
              <span
                key={idx}
                className="block text-xs font-mono bg-gray-50 border rounded px-1 py-0.5 text-gray-800"
              >
                {sz.width}" × {sz.length}"
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 text-xs italic">—</span>
        ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-primary-600 hover:text-primary-700"
            title="Edit"
          >
            <FiEdit2 size={18} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-danger-600 hover:text-danger-700"
            title="Delete"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2  bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FiPackage className="text-primary-600" />
                Inventory Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your product inventory with buying/selling prices and
                images
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={FiPlus}
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="w-full md:w-52"
            >
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white">
            <div className="text-center">
              <p className="text-gray-600 text-sm md:text-base">Total Items</p>
              {loading ? (
                <p className="mt-3 font-bold">Updating...</p>
              ) : (
                <p className="text-2xl md:text-3xl font-bold text-primary-600">
                  {totalItems}
                </p>
              )}
            </div>
          </Card>
          <Card className="bg-white">
            <div className="text-center">
              <p className="text-gray-600 text-sm md:text-base">Low Stock</p>
              {loading ? (
                <p className="mt-3 font-bold">Updating...</p>
              ) : (
                <p className="text-2xl md:text-3xl font-bold text-warning-600">
                  {lowStockCount}
                </p>
              )}
            </div>
          </Card>
          <Card className="bg-white">
            <div className="text-center">
              <p className="text-gray-600 text-sm md:text-base">Out of Stock</p>
              {loading ? (
                <p className="mt-3 font-bold">Updating...</p>
              ) : (
                <p className="text-2xl md:text-3xl font-bold text-danger-600">
                  {outOfStockCount}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search Products"
              icon={FiSearch}
              placeholder="Search by name..."
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Select
              label="Category"
              options={Object.entries(PRODUCT_CATEGORIES).map(
                ([key, value]) => ({
                  value,
                  label: key.replace("_", " "),
                })
              )}
              onChange={(e) => setFilterCategory(e.target.value)}
              value={filterCategory}
            />
            <div className="flex items-end">
              <Button
                variant={showLowStockOnly ? "primary" : "secondary"}
                className="w-full"
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              >
                {showLowStockOnly ? "Show All" : "Low Stock Only"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-x-auto">
          <div className="overflow-x-auto">
            {loading ? (
              <LoadingSpinner size="md" />
            ) : (
              <Table
                columns={columns}
                data={filteredItems}
                emptyMessage="No products found"
              />
            )}
          </div>
        </Card>
      </motion.div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingItem ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Product Name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Wooden Door Premium"
            />

            <Select
              className={"sm"}
              label="Category"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              options={Object.entries(PRODUCT_CATEGORIES).map(
                ([key, value]) => ({
                  value,
                  label: key.replace("_", " "),
                })
              )}
            />
          </div>

          {/* Size Variants Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                Size Variants (if any)
              </h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addSizeVariant}
                icon={FiPlus}
              >
                Add Size
              </Button>
            </div>

            {hassizes && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Selling price will be calculated as:{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    Width × Length ÷ 144 × Rate
                  </code>
                </p>
              </div>
            )}

            <div className="space-y-3">
              {formData.sizes.map((variant, index) => (
                <div
                  key={index}
                  className="grid gap-3 grid-cols-2 md:grid-cols-3 bg-gray-50 p-3 rounded-lg"
                >
                  <div className="w-full">
                    <Input
                      label="Width (inch)"
                      type="number"
                      placeholder="Width"
                      min="0"
                      step="0.01"
                      value={variant.width}
                      onChange={(e) =>
                        updateSizeVariant(index, "width", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      label="Length (inch)"
                      type="number"
                      placeholder="Length"
                      min="0"
                      step="0.01"
                      value={variant.length}
                      onChange={(e) =>
                        updateSizeVariant(index, "length", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeSizeVariant(index)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
                      title="Remove size variant"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Quantity"
              type="number"
              min="0"
              required
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="0"
            />
            <Input
              label={
                hassizes
                  ? "Buying price per sqft (PKR)"
                  : "Buying Price per item (PKR)"
              }
              type="number"
              min="0"
              step="1"
              required
              value={formData.buyingPrice}
              onChange={(e) =>
                setFormData({ ...formData, buyingPrice: e.target.value })
              }
              placeholder="0.00"
            />
            <Input
              label={
                hassizes
                  ? "Selling price per sqft (PKR)"
                  : "Selling Price per Item (PKR)"
              }
              type="number"
              min="0"
              step="1"
              required
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({ ...formData, sellingPrice: e.target.value })
              }
              placeholder="0.00"
            />
          </div>

          {formData.buyingPrice && formData.sellingPrice && (
            <>
              {calculateMargin() < 0 ? (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                  <p className="text-sm text-danger-700">
                    <strong>Profit Margin: {calculateMargin()}</strong>%
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                  <p className="text-sm text-success-700">
                    <strong>Profit Margin: {calculateMargin()}%</strong>%
                  </p>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Select
              label="Condition"
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
              options={Object.entries(PRODUCT_CONDITIONS).map(
                ([key, value]) => ({
                  value,
                  label: key.replace("_", " "),
                })
              )}
            />

            {/* <div className="min-w-8">
              {!previewImage ? (
                <FileUpload
                  label="Upload Product Image"
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  onChange={handleImageUpload}
                  required
                />
              ) : (
                <div className="relative inline-block">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-96 max-w-xs h-auto rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setImageFile(null);
                      setFormData({ ...formData, image: null });
                    }}
                    className="absolute -top-2 -right-2 bg-danger-600 text-white rounded-full p-1 hover:bg-danger-700"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div> */}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:flex-1"
            >
              {editingItem ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
