import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiDownload,
  FiEye,
  FiTrash2,
  FiPrinter,
  FiPackage,
  FiAlertCircle,
} from "react-icons/fi";
import {
  fetchInvoices,
  createInvoice,
  deleteInvoice,
} from "../../slices/invoiceSlice";
import {
  fetchInventory,
  updateInventoryItem,
  updateStock,
} from "../../slices/inventorySlice";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-hot-toast";
import {
  INVOICE_TYPES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  BANK_LIST,
} from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/helpers";
import {
  downloadInvoicePDF,
  previewInvoicePDF,
  printInvoicePDF,
} from "../../utils/pdfGenerator";
import FileUpload from "../../components/common/FileUpload";

const Invoice = () => {
  const dispatch = useDispatch();
  const { invoices, loading, trigger } = useSelector(
    (state) => state.invoice
  );
  const { items: inventoryItems } = useSelector((state) => state.inventory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lossWarning, setLossWarning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    name: "",
    address: "",
    phoneNumber: "",
    invoiceType: INVOICE_TYPES.SELLING,
    items: [{ productId: "", sizeIdx: null, quantity: 1 }],
    taxRate: 0,
    discountRate: 0,
    paymentProof: null,
    paymentStatus: "pending",
    bankUsed: "",
    shippingCost: 0,
    supplierName: "",
    notes: "",
  });

  // Fetch invoices on component mount
  useEffect(() => {
    dispatch(fetchInvoices());
  }, []);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper: Get selected product from inventory
  const getSelectedProduct = (productId) => {
    return inventoryItems?.find(
      (p) => p.id === productId || p._id === productId
    );
  };

  // Helper: Calculate line item price (selling and buying)
  const calculateLinePrice = (item) => {
    const product = getSelectedProduct(item.productId);
    if (!product) return { sell: 0, buy: 0, quantity: item.quantity || 1 };

    let sellPrice = 0;
    let buyPrice = 0;

    // If product has sizes and size is selected
    if (product.sizes?.length > 0 && item.sizeIdx !== null) {
      const size = product.sizes[item.sizeIdx];
      const area = (size.width * size.length) / 144;
      if (item.buyingPrice != "") {
        sellPrice = area * product.sellingPrice * item.quantity;
        buyPrice = area * item.buyingPrice * item.quantity;
      }else{
        sellPrice = area * product.sellingPrice * item.quantity;
        buyPrice = area * product.buyingPrice * item.quantity;
      }
    } else {
      if (item.buyingPrice != "") {
        sellPrice = product.sellingPrice * item.quantity;
        buyPrice = item.buyingPrice * item.quantity;
      } else {
        sellPrice = product.sellingPrice * item.quantity;
        buyPrice = product.buyingPrice * item.quantity;
      }
      // No sizes, use quantity-based pricing
      // sellPrice = item.quantity * product.sellingPrice;
      // buyPrice = item.quantity * product.buyingPrice;
    }

    return { sell: sellPrice, buy: buyPrice, quantity: item.quantity };
  };

  // Helper: Calculate total invoice (with tax and discount)
  const calculateInvoiceTotals = () => {
    const subtotalSell = formData.items.reduce(
      (sum, item) => sum + calculateLinePrice(item).sell,
      0
    );
    const subtotalBuy = formData.items.reduce(
      (sum, item) => sum + calculateLinePrice(item).buy,
      0
    );

    // For buying invoices taxes & discount should be applied to buy subtotal
    const baseSubtotal =
      formData.invoiceType === INVOICE_TYPES.BUYING
        ? subtotalBuy
        : subtotalSell;
    const taxAmount = (baseSubtotal * formData.taxRate) / 100;
    const discountAmount = (baseSubtotal * formData.discountRate) / 100;
    const total = baseSubtotal + taxAmount - discountAmount;

    // Check for loss
    const isInLoss = total < subtotalBuy;
    const profit =
      formData.invoiceType !== INVOICE_TYPES.BUYING
        ? INVOICE_TYPES.DROPSHIPPING
          ? total - subtotalBuy - Number(formData.shippingCost)
          : total - subtotalBuy
        : 0;

    return {
      subtotalSell,
      subtotalBuy,
      baseSubtotal,
      taxAmount,
      discountAmount,
      total,
      profit,
      isInLoss,
    };
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [{ productId: "", sizeIdx: null, quantity: 1 }, ...formData.items],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Reset size index when product changes
    if (field === "productId") {
      newItems[index].sizeIdx = null;
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check product selection and out-of-stock only matters for selling
    const hasOutOfStock = formData.items.some((item) => {
      const prod = getSelectedProduct(item.productId);
      if (!prod) return true; // product must exist for both buying and selling
      if (formData.invoiceType === INVOICE_TYPES.BUYING) return false; // restocking allowed
      return prod.quantity === 0;
    });

    if (hasOutOfStock && formData.invoiceType === INVOICE_TYPES.SELLING) {
      toast.error("One or more selected products are out of stock!");
      return;
    }

    // If buying invoice, supplier info must be provided
    if (formData.invoiceType === INVOICE_TYPES.BUYING) {
      if (!formData.name || !formData.phoneNumber) {
        toast.error(
          "Please provide supplier name and phone for buying invoices"
        );
        return;
      }
    }

    // Validation: For selling ensure we have enough stock. For buying we don't block (we increase stock)
    const lessQuantity = formData.items.some((item) => {
      if (formData.invoiceType === INVOICE_TYPES.BUYING) return false;
      const prod = getSelectedProduct(item.productId);
      return prod.quantity < item.quantity;
    });

    if (lessQuantity && formData.invoiceType === INVOICE_TYPES.SELLING) {
      toast.error("One or more selected products are low in stock!");
      return;
    }

    // Validation: Check if all items have required fields
    // In buying mode user must select existing products, provide size when needed
    const hasIncompleteItems = formData.items.some((item) => {
      const prod = getSelectedProduct(item.productId);
      if (!prod) return true; // buying requires selecting existing products
      if (prod?.sizes?.length > 0 && item.sizeIdx === null) return true;
      return false;
    });

    if (hasIncompleteItems) {
      toast.error("Please complete all item fields!");
      return;
    }

    // Show warning if in loss (selling mode) - buying invoices do not show loss warnings
    const totals = calculateInvoiceTotals();
    if (formData.invoiceType === INVOICE_TYPES.SELLING && totals.isInLoss) {
      const confirmed = window.confirm(
        `Warning: You are selling at a loss of ${formatCurrency(
          totals.subtotalBuy - totals.total
        )}. Do you want to continue?`
      );
      if (!confirmed) return;
    }

    // If payment is paid and not cash, payment proof must be uploaded (not for quotations)
    // bankUsed may arrive as different case; normalize to upper-case code comparison against 'CASH'
    if (
      formData.invoiceType !== INVOICE_TYPES.QUOTATION &&
      formData.paymentStatus === "paid" &&
      String(formData.bankUsed || "").toUpperCase() !== "CASH" &&
      !formData.paymentProof
    ) {
      toast.error("Payment proof is required for paid non-cash payments");
      return;
    }

    try {
      const invoiceData = {
        ...formData,
        subtotal: totals.baseSubtotal ?? totals.subtotalSell,
        tax: totals.taxAmount,
        discount: totals.discountAmount,
        total: totals.total,
        profit: totals.profit,
        // For quotations, clear payment-related fields since they are not applicable
        ...(formData.invoiceType === INVOICE_TYPES.QUOTATION && {
          paymentStatus: null,
          bankUsed: "",
          paymentProof: null,
        }),
        items: await Promise.all(
          formData.items.map(async (item) => {
            const product = getSelectedProduct(item.productId);
            const linePrice = calculateLinePrice(item);

            // For quotations, skip inventory and profit/revenue updates
            if (formData.invoiceType === INVOICE_TYPES.QUOTATION) {
              const newQuantity =
                (product.quantity || 0) - Number(item.quantity || 0);
              await dispatch(
                updateStock({
                  id: product._id,
                  data: { quantity: newQuantity },
                })
              ).unwrap();
              return {
                ...item,
                productName: product?.name,
                sizeDisplay: product?.sizes?.[item.sizeIdx]
                  ? `${product.sizes[item.sizeIdx].width} x ${
                      product.sizes[item.sizeIdx].length
                    }`
                  : null,
                unitPrice: product?.sellingPrice,
                lineTotal: linePrice.sell,
              };
            }

            if (formData.invoiceType === INVOICE_TYPES.BUYING) {
              // Increase inventory quantity
              const newQuantity =
                (product.quantity || 0) + Number(item.quantity || 0);
              await dispatch(
                updateStock({
                  id: product._id,
                  data: { quantity: newQuantity },
                })
              ).unwrap();

              // For buying invoice we do not record profit/revenue here (purchase), invoice stored in invoices DB
              return {
                ...item,
                productName: product?.name,
                sizeDisplay: product?.sizes?.[item.sizeIdx]
                  ? `${product.sizes[item.sizeIdx].width} x ${
                      product.sizes[item.sizeIdx].length
                    }`
                  : null,
                unitPrice:
                  item.buyingPrice != null
                    ? Number(item.buyingPrice)
                    : product?.buyingPrice,
                lineTotal: linePrice.buy,
              };
            }

            // DROPSHIPPING flow: decrease stock, record profit/revenue (similar to selling)
            if (formData.invoiceType === INVOICE_TYPES.DROPSHIPPING) {
              // Calculate profit after deducting shipping cost
              const itemProfit = Number(
                linePrice.sell - linePrice.buy - (formData.shippingCost || 0) ||
                  0
              );

              return {
                ...item,
                productName: product?.name,
                sizeDisplay: product?.sizes?.[item.sizeIdx]
                  ? `${product.sizes[item.sizeIdx].width} x ${
                      product.sizes[item.sizeIdx].length
                    }`
                  : null,
                unitPrice: product?.sellingPrice,
                lineTotal: linePrice.sell,
              };
            }

            // SELLING flow: decrease stock, record profit/revenue
            // compute new inventory quantity and persist it
            const newQuantity = (product.quantity || 0) - item.quantity;
            await dispatch(
              updateStock({ id: product._id, data: { quantity: newQuantity } })
            ).unwrap();

            return {
              ...item,
              productName: product?.name,
              sizeDisplay: product?.sizes?.[item.sizeIdx]
                ? `${product.sizes[item.sizeIdx].width} x ${
                    product.sizes[item.sizeIdx].length
                  }`
                : null,
              unitPrice: product?.sizes?.[item.sizeIdx]
                ? ((product.sizes[item.sizeIdx].width *
                    product.sizes[item.sizeIdx].length) /
                    144) *
                  product.sellingPrice
                : product?.sellingPrice,
              lineTotal: linePrice.sell,
            };
          })
        ),
      };
      await dispatch(createInvoice(invoiceData)).unwrap();
      toast.success("Invoice created successfully!");
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error || "Failed to create invoice");
    }
  };

  // Payment proof upload
  // const handlePaymentProofUpload = (files) => {
  //   if (!files || files.length === 0) return;
  //   const file = files[0];
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     setFormData({ ...formData, paymentProof: e.target.result });
  //   };
  //   reader.readAsDataURL(file);
  // };

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  const handlePaymentProofUpload = (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData({ ...formData, paymentProof: e.target.result });
    };
    reader.readAsDataURL(file);
  };


  const handleDownloadPDF = (invoice) => {
    try {
      downloadInvoicePDF(invoice);
      toast.success("Invoice downloaded!");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const handlePreviewPDF = (invoice) => {
    try {
      previewInvoicePDF(invoice);
    } catch (error) {
      toast.error("Failed to preview PDF");
    }
  };

  const handlePrintPDF = (invoice) => {
    try {
      printInvoicePDF(invoice);
      toast.success("Printing invoice...");
    } catch (error) {
      toast.error("Failed to print PDF");
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await dispatch(deleteInvoice(id)).unwrap();
        toast.success("Invoice deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete invoice");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: `INV-${Date.now()}`,
      name: "",
      address: "",
      phoneNumber: "",
      invoiceType: INVOICE_TYPES.SELLING,
      items: [{ productId: "", sizeIdx: null, quantity: 1 }],
      taxRate: 0,
      discountRate: 0,
      paymentProof: null,
      paymentStatus: "pending",
      bankUsed: "",
      shippingCost: 0,
      supplierName: "",
      notes: "",
    });
    setLossWarning(false);
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
    { header: "Invoice #", accessor: "invoiceNumber" },
    {
      header: "Customer/ Supplier",

      render: (row) => (row.invoiceType === "selling" ? row.name : row.name),
    },
    {
      header: "Type",
      render: (row) => <span className="capitalize">{row.invoiceType}</span>,
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.total)}</span>
      ),
    },
    {
      header: "Status",
      render: (row) =>
        getStatusBadge(row.paymentStatus ? row.paymentStatus : "N/A"),
    },
    {
      header: "Date",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePreviewPDF(row)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Preview"
          >
            <FiEye className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDownloadPDF(row)}
            className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
            title="Download PDF"
          >
            <FiDownload className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePrintPDF(row)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Print"
          >
            <FiPrinter className="w-4 h-4" />
          </motion.button>
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

  // Get product options from inventory (only in-stock or show out of stock)
  const productOptions = (inventoryItems || []).map((product) => ({
    value: product.id || product._id,
    label: product.name + (product.quantity === 0 ? " (Out of stock)" : ""),
    // If buying, allow selecting out-of-stock products for restocking. For selling, keep disabled if out of stock.
    disabled:
      formData.invoiceType !== INVOICE_TYPES.BUYING && product.quantity === 0,
  }));

  const bankOptions = BANK_LIST.map((bank) => ({
    value: bank.code,
    label: bank.name,
  }));

  const invoiceTypeOptions = Object.entries(INVOICE_TYPES).map(
    ([key, value]) => ({
      value,
      label: key,
    })
  );

  const totals = calculateInvoiceTotals();

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
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiPackage className="text-primary-600" />
            Invoice Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage invoices with PDF export
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            className={"w-full md:w-48 md:float-right"}
            icon={FiPlus}
            onClick={() => {
              dispatch(fetchInventory({}));
              setIsModalOpen(true);
            }}
          >
            Create Invoice
          </Button>
        </motion.div>
      </motion.div>

      {/* Table Card */}
      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search by invoice #, customer name, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading && invoices.length === 0 ? (
          <LoadingSpinner size="md" />
        ) : (
          <Table
            columns={columns}
            data={filteredInvoices}
            loading={loading}
            emptyMessage="No invoices found. Create your first invoice to get started!"
          />
        )}
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Create New Invoice"
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
            <Button onClick={handleSubmit}>Create Invoice</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invoice Number & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Invoice Number"
              required
              value={formData.invoiceNumber}
              onChange={(e) =>
                setFormData({ ...formData, invoiceNumber: e.target.value })
              }
              placeholder="INV-001"
            />
            <Select
              label="Invoice Type"
              required
              value={formData.invoiceType}
              onChange={(e) =>
                setFormData({ ...formData, invoiceType: e.target.value })
              }
              options={invoiceTypeOptions}
            />
          </div>

          {/* Customer Details */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              {formData.invoiceType === INVOICE_TYPES.BUYING
                ? "Supplier Information"
                : "Customer Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={
                  formData.invoiceType === INVOICE_TYPES.BUYING
                    ? "Supplier Name"
                    : "Customer Name"
                }
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={
                  formData.invoiceType === INVOICE_TYPES.BUYING
                    ? "Enter supplier name"
                    : "Enter customer name"
                }
              />
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  })
                }
                placeholder={
                  formData.invoiceType === INVOICE_TYPES.BUYING
                    ? "Supplier address"
                    : "Customer address"
                }
              />
              <Input
                label="Phone"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phoneNumber: e.target.value,
                  })
                }
                placeholder="+92-XXX-XXXXXXX"
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Invoice Items</h3>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addItem}
                  icon={FiPlus}
                >
                  Add Item
                </Button>
              </motion.div>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => {
                const product = getSelectedProduct(item.productId);
                const lessQuantity =
                  product?.quantity < item?.quantity && product?.quantity != 0;
                const hasSizes = product?.sizes && product.sizes.length > 0;
                const isOutOfStock = product?.quantity === 0;
                const linePrice = calculateLinePrice(item);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    {isOutOfStock && formData.invoiceType !== "buying" && (
                      <div className="mb-3 flex items-center gap-2 p-2 bg-danger-50 rounded text-danger-700 text-sm">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>This product is out of stock</span>
                      </div>
                    )}

                    {/* Low Stock Alert */}
                    {lessQuantity && formData?.invoiceType !== "buying" && (
                      <div className="mb-3 flex items-center gap-2 p-2 bg-danger-50 rounded text-danger-700 text-sm">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>
                          <strong>{product.name} </strong>
                          is low in stock! Only {product.quantity} items
                          remaining.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 lg:grid-cols-6 md:grid-cols-6 gap-2">
                      {/* Product Select */}
                      <div>
                        <Select
                          label="Product"
                          required
                          value={item.productId}
                          onChange={(e) =>
                            updateItem(index, "productId", e.target.value)
                          }
                          options={productOptions}
                        />
                      </div>

                      {/* Size Select (conditional) */}
                      {hasSizes &&
                        // (formData?.invoiceType === "selling" ||
                        //   formData?.invoiceType ===
                        //     INVOICE_TYPES.DROPSHIPPING) && (
                          <div>
                            <Select
                              label="Size (W x L)"
                              required
                              value={item.sizeIdx !== null ? item.sizeIdx : ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "sizeIdx",
                                  e.target.value !== ""
                                    ? Number(e.target.value)
                                    : null
                                )
                              }
                              options={product.sizes.map((size, idx) => ({
                                value: idx,
                                label: `${size.width} x ${size.length}`,
                              }))}
                            />
                          </div>
                        // )
                        }

                      <div>
                        <Input
                          label="Quantity"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          required
                        />
                      </div>

                      {/* Unit Price Display / Buying price input for BUYING invoices */}
                      <div>
                        {formData.invoiceType === INVOICE_TYPES.BUYING ? (
                          <>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price per unit
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                item.buyingPrice ?? product?.buyingPrice ?? ""
                              }
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "buyingPrice",
                                  e.target.value !== ""
                                    ? Number(e.target.value)
                                    : ""
                                )
                              }
                              placeholder="0.00"
                              required
                            />
                          </>
                        ) : (
                          <>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Unit Price
                            </label>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(product?.sellingPrice || 0)}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Line Total */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Line Total
                        </label>
                        <p className="text-lg font-semibold text-primary-600">
                          {formatCurrency(
                            formData.invoiceType === INVOICE_TYPES.BUYING
                              ? linePrice.buy
                              : linePrice.sell
                          )}
                        </p>
                      </div>

                      {/* Delete Button */}
                      {formData.items.length > 1 && (
                        <div className="flex items-end">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Delete Item"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Totals Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totals.baseSubtotal ?? totals.subtotalSell)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  Tax ({formData.taxRate}%):
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totals.taxAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  Discount ({formData.discountRate}%):
                </span>
                <span className="font-semibold text-danger-600">
                  -{formatCurrency(totals.discountAmount)}
                </span>
              </div>

              {/* Loss Warning */}
              {totals.isInLoss && formData?.invoiceType === "selling" && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 bg-danger-50 rounded border border-danger-200"
                >
                  <FiAlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-danger-900">Loss Alert</p>
                    <p className="text-danger-700">
                      You are selling at a loss of{" "}
                      <strong>
                        {formatCurrency(totals.subtotalBuy - totals.total)}
                      </strong>
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total:</span>
                <span
                  className={
                    totals.isInLoss ? "text-danger-600" : "text-primary-600"
                  }
                >
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Tax, Discount & Payment Details */}
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Tax Rate (%)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) =>
                setFormData({ ...formData, taxRate: Number(e.target.value) })
              }
            />
            <Input
              label="Discount Rate (%)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.discountRate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountRate: Number(e.target.value),
                })
              }
            />

            {/* Hide payment fields for quotations */}
            {formData.invoiceType !== INVOICE_TYPES.QUOTATION && (
              <>
                <Select
                  label="Payment Status"
                  value={formData.paymentStatus}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, paymentStatus: e.target.value })
                  }
                  options={PAYMENT_STATUS}
                />
                <Select
                  label="Bank Used"
                  value={formData.bankUsed}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, bankUsed: e.target.value })
                  }
                  options={bankOptions}
                />
              </>
            )}
          </div>
          {/* Payment proof required when paid and not cash */}
          {formData.paymentStatus === "paid" &&
            String(formData.bankUsed || "").toUpperCase() !== "CASH" && (
              <div className="md:col-span-4">
                <FileUpload
                  label="Payment Proof (required)"
                  accept={"image/*,application/pdf"}
                  maxSize={5 * 1024 * 1024}
                  onChange={(files) => handlePaymentProofUpload(files)}
                />
              </div>
            )}

          {/* Dropshipping Details - only for dropshipping invoices */}
          {formData.invoiceType === INVOICE_TYPES.DROPSHIPPING && (
            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="supplier Name"
                required
                value={formData.supplierName}
                onChange={(e) =>
                  setFormData({ ...formData, supplierName: e.target.value })
                }
                placeholder="Enter supplier name"
              />
              <Input
                label="Shipping Cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.shippingCost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingCost: Number(e.target.value),
                  })
                }
                placeholder="0.00"
              />
            </div>
          )}

          {/* Notes */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional invoice notes..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Invoice;
