/**
 * Calculate price for a single invoice item
 * @param {Object} item - Invoice item { productId, sizeIdx, quantity }
 * @param {Array} inventoryItems - All inventory products
 * @returns {Object} { sell, buy, quantity }
 */
export const calculateLinePrice = (item, inventoryItems) => {
  const product = inventoryItems?.find(
    (p) => p.id === item.productId || p._id === item.productId
  );

  if (!product) return { sell: 0, buy: 0, quantity: 1 };

  let sellPrice = 0;
  let buyPrice = 0;

  // If product has sizes and size is selected
  if (product.sizes?.length > 0 && item.sizeIdx !== null) {
    const size = product.sizes[item.sizeIdx];
    const area = (size.width * size.length) / 144;
    sellPrice = area * product.sellingPrice;
    buyPrice = area * product.buyingPrice;
  } else {
    // No sizes, use quantity-based pricing
    sellPrice = item.quantity * product.sellingPrice;
    buyPrice = item.quantity * product.buyingPrice;
  }

  return { sell: sellPrice, buy: buyPrice, quantity: item.quantity };
};

/**
 * Calculate complete invoice totals
 * @param {Array} items - Array of invoice items
 * @param {number} taxRate - Tax percentage
 * @param {number} discountRate - Discount percentage
 * @param {Array} inventoryItems - All inventory products
 * @returns {Object} Complete totals object
 */
export const calculateInvoiceTotals = (
  items,
  taxRate,
  discountRate,
  inventoryItems
) => {
  const subtotalSell = items.reduce(
    (sum, item) => sum + calculateLinePrice(item, inventoryItems).sell,
    0
  );

  const subtotalBuy = items.reduce(
    (sum, item) => sum + calculateLinePrice(item, inventoryItems).buy,
    0
  );

  const taxAmount = (subtotalSell * taxRate) / 100;
  const discountAmount = (subtotalSell * discountRate) / 100;
  const total = subtotalSell + taxAmount - discountAmount;

  // Check if selling at loss
  const isInLoss = total < subtotalBuy;

  return {
    subtotalSell,
    subtotalBuy,
    taxAmount,
    discountAmount,
    total,
    isInLoss,
    lossAmount: isInLoss ? subtotalBuy - total : 0,
  };
};

/**
 * Get selected product from inventory
 * @param {string} productId - Product ID to find
 * @param {Array} inventoryItems - All inventory items
 * @returns {Object} Product object or undefined
 */
export const getSelectedProduct = (productId, inventoryItems) => {
  return inventoryItems?.find((p) => p.id === productId || p._id === productId);
};

/**
 * Validate invoice data before submission
 * @param {Object} formData - Invoice form data
 * @param {Array} inventoryItems - All inventory items
 * @returns {Object} { isValid, error }
 */
export const validateInvoice = (formData, inventoryItems) => {
  // Check if no items
  if (!formData.items || formData.items.length === 0) {
    return { isValid: false, error: "At least one item is required" };
  }

  // Check if any product is out of stock
  const hasOutOfStock = formData.items.some((item) => {
    const prod = getSelectedProduct(item.productId, inventoryItems);
    return !prod || prod.quantity === 0;
  });

  if (hasOutOfStock) {
    return {
      isValid: false,
      error: "One or more selected products are out of stock",
    };
  }

  // Check if all items have required fields
  const hasIncompleteItems = formData.items.some((item) => {
    if (!item.productId) return true;
    const prod = getSelectedProduct(item.productId, inventoryItems);
    if (prod?.sizes?.length > 0 && item.sizeIdx === null) return true;
    return false;
  });

  if (hasIncompleteItems) {
    return { isValid: false, error: "Please complete all item fields" };
  }

  // Validate customer name
  if (!formData.customerName || formData.customerName.trim() === "") {
    return { isValid: false, error: "Customer name is required" };
  }

  return { isValid: true, error: null };
};

/**
 * Format invoice items for database storage
 * @param {Array} items - Raw invoice items
 * @param {Array} inventoryItems - All inventory items
 * @returns {Array} Formatted items with additional data
 */
export const formatInvoiceItems = (items, inventoryItems) => {
  return items.map((item) => {
    const product = getSelectedProduct(item.productId, inventoryItems);
    const linePrice = calculateLinePrice(item, inventoryItems);

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
      costPrice: linePrice.buy,
    };
  });
};

/**
 * Check if user is selling at loss
 * @param {Object} totals - Totals object from calculateInvoiceTotals
 * @returns {boolean} True if selling at loss
 */
export const isSellingAtLoss = (totals) => {
  return totals.isInLoss === true;
};

/**
 * Generate confirmation message for loss
 * @param {Object} totals - Totals object
 * @param {Function} formatCurrency - Currency formatter
 * @returns {string} Formatted message
 */
export const getLossMessage = (totals, formatCurrency) => {
  return `Warning: You are selling at a loss of ${formatCurrency(
    totals.lossAmount
  )}. Do you want to continue?`;
};

/**
 * Get product options for select dropdown
 * @param {Array} inventoryItems - All inventory items
 * @returns {Array} Options for Select component
 */
export const getProductOptions = (inventoryItems = []) => {
  return inventoryItems.map((product) => ({
    value: product.id || product._id,
    label: product.name + (product.quantity === 0 ? " (Out of stock)" : ""),
    disabled: product.quantity === 0,
  }));
};

/**
 * Get size options for select dropdown
 * @param {Object} product - Product object
 * @returns {Array} Options for Select component
 */
export const getSizeOptions = (product) => {
  if (!product?.sizes?.length) return [];
  return product.sizes.map((size, idx) => ({
    value: idx,
    label: `${size.width} x ${size.length}`,
  }));
};

/**
 * Calculate margin percentage
 * @param {Object} totals - Totals object
 * @returns {number} Margin percentage
 */
export const calculateMarginPercentage = (totals) => {
  if (totals.subtotalBuy === 0) return 0;
  return ((totals.total - totals.subtotalBuy) / totals.subtotalBuy) * 100;
};

/**
 * Check if product has sizes
 * @param {Object} product - Product object
 * @returns {boolean}
 */
export const productHasSizes = (product) => {
  return (
    product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
  );
};

/**
 * Get unit price for display
 * @param {Object} item - Invoice item
 * @param {Object} product - Product object
 * @returns {number} Unit price
 */
export const getUnitPrice = (item, product) => {
  if (productHasSizes(product) && item.sizeIdx !== null) {
    const size = product.sizes[item.sizeIdx];
    return ((size.width * size.length) / 144) * product.sellingPrice;
  }
  return product?.sellingPrice || 0;
};

/**
 * Reset invoice form to default state
 * @returns {Object} Default form data
 */
export const getDefaultFormData = () => {
  return {
    invoiceNumber: `INV-${Date.now()}`,
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    invoiceType: "service",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    items: [{ productId: "", sizeIdx: null, quantity: 1 }],
    taxRate: 0,
    discountRate: 0,
    paymentStatus: "pending",
    paymentMethod: "",
    bankUsed: "",
    notes: "",
  };
};

/**
 * Export invoice summary as JSON
 * @param {Object} invoice - Complete invoice object
 * @returns {string} JSON string
 */
export const exportInvoiceJSON = (invoice) => {
  return JSON.stringify(invoice, null, 2);
};

/**
 * Calculate cost per unit area (for sized products)
 * @param {Object} product - Product object
 * @param {number} sizeIdx - Size index
 * @returns {number} Cost per unit area
 */
export const getCostPerArea = (product, sizeIdx) => {
  if (!productHasSizes(product) || sizeIdx === null) return 0;
  const size = product.sizes[sizeIdx];
  const area = (size.width * size.length) / 144;
  return area ? product.buyingPrice / area : 0;
};

// Export all as default object for easier imports
export default {
  calculateLinePrice,
  calculateInvoiceTotals,
  getSelectedProduct,
  validateInvoice,
  formatInvoiceItems,
  isSellingAtLoss,
  getLossMessage,
  getProductOptions,
  getSizeOptions,
  calculateMarginPercentage,
  productHasSizes,
  getUnitPrice,
  getDefaultFormData,
  exportInvoiceJSON,
  getCostPerArea,
};
