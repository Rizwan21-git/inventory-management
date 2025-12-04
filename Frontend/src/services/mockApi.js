const delay = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // Auth
  login: async () => {
    await delay(800);
    return {
      success: true,
      data: {
        token: "mock-jwt-token",
        user: {
          id: 1,
          name: "Muhammad Rizwan",
          email: "Example@gmail.com",
          role: "admin",
        },
      },
    };
  },

  getCurrentUser: async () => {
    await delay(100);
    return {
      success: true,
      data: {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        role: "user",
      },
    };
  },

  // Dashboard
  getDashboardStats: async () => {
    // support optional params: { period: 'this_year'|'year', year: 2025, month: 1 }
    await delay(200);
    // Example KPI dataset - in a real backend this would be computed from DB for the requested period
    const buildKpis = (period = "this_year", opts = {}) => {
      // simple deterministic sample data and monthly breakdown to support UI testing
      const year = opts.year || new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i + 1);

      // monthly sample values (PKR)
      const monthlyRevenue = months.map((m) => 150000 + m * 10000);
      const monthlyInvestment = months.map((m) => 80000 + m * 4000);
      const monthlyExpenses = months.map((m) => 50000 + m * 2000);

      const totalRevenue = monthlyRevenue.reduce((s, v) => s + v, 0);
      const totalInvestment = monthlyInvestment.reduce((s, v) => s + v, 0);
      const totalExpenses = monthlyExpenses.reduce((s, v) => s + v, 0);
      const grossProfit = totalRevenue - totalInvestment;
      const netProfit = grossProfit - totalExpenses;

      return {
        period,
        year,
        monthly: months.map((m, idx) => ({
          month: m,
          revenue: monthlyRevenue[idx],
          investment: monthlyInvestment[idx],
          expenses: monthlyExpenses[idx],
          grossProfit: monthlyRevenue[idx] - monthlyInvestment[idx],
          netProfit:
            monthlyRevenue[idx] - monthlyInvestment[idx] - monthlyExpenses[idx],
        })),
        totals: {
          totalRevenue,
          totalInvestment,
          totalExpenses,
          grossProfit,
          netProfit,
        },
      };
    };

    // default (no params) returns basic site stats + this year KPIs
    return {
      success: true,
      data: {
        totalInventory: 156,
        totalRevenue: 2500000,
        totalInvoices: 42,
        activeProjects: 8,
        doorsCount: 89,
        doorsInStock: 75,
        doorsLowStock: 14,
        interiorCount: 67,
        interiorInStock: 58,
        interiorLowStock: 9,
        kpis: buildKpis("this_year", { year: new Date().getFullYear() }),
      },
    };
  },

  getDashboardYears: async () => {
    await delay(30);
    // Return available years for KPI data (simulate DB)
    // For the mock data set we return last 4 years
    const current = new Date().getFullYear();
    return {
      success: true,
      data: [current, current - 1, current - 2, current - 3],
    };
  },

  // Inventory
  getInventory: async ({ search = "", category = "" }) => {
    await delay(0);
    return {
      success: true,
      data: {
        items: [
          {
            id: 1,
            name: "Wooden Door Premium",
            category: "doors",
            quantity: 25,
            buyingPrice: 20000,
            sellingPrice: 30000,
            condition: "new",
            sizes: [
              { width: 67, length: 89 },
              { width: 47, length: 89 },
              { width: 27, length: 89 },
              { width: 97, length: 89 },
            ],
          },
          {
            id: 2,
            name: "Steel Door Security",
            category: "doors",
            quantity: 8,
            buyingPrice: 50000,
            sellingPrice: 60000,
            condition: "new",
          },
          {
            id: 3,
            name: "Kitchen Cabinet Set",
            category: "home_interior",
            quantity: 0,
            buyingPrice: 8500,
            sellingPrice: 15000,
            condition: "new",
          },
          {
            id: 4,
            name: "Aluminium Window Frame",
            category: "doors",
            quantity: 15,
            buyingPrice: 12000,
            sellingPrice: 18000,
            condition: "new",
            sizes: [
              { width: 36, length: 60 },
              { width: 48, length: 60 },
              { width: 60, length: 75 },
            ],
          },
          {
            id: 5,
            name: "Glass Door Sliding",
            category: "doors",
            quantity: 5,
            buyingPrice: 35000,
            sellingPrice: 50000,
            condition: "new",
          },
          {
            id: 6,
            name: "Wooden Wardrobe",
            category: "home_interior",
            quantity: 12,
            buyingPrice: 15000,
            sellingPrice: 25000,
            condition: "new",
            sizes: [
              { width: 72, length: 84 },
              { width: 84, length: 84 },
              { width: 96, length: 96 },
            ],
          },
          {
            id: 7,
            name: "Ceiling Fan Modern",
            category: "home_interior",
            quantity: 18,
            buyingPrice: 3500,
            sellingPrice: 6000,
            condition: "new",
          },
          {
            id: 8,
            name: "Bathroom Cabinet",
            category: "home_interior",
            quantity: 10,
            buyingPrice: 5000,
            sellingPrice: 8500,
            condition: "new",
          },
          {
            id: 9,
            name: "Wooden Shelving Unit",
            category: "home_interior",
            quantity: 7,
            buyingPrice: 8000,
            sellingPrice: 12000,
            condition: "new",
            sizes: [
              { width: 48, length: 72 },
              { width: 60, length: 84 },
            ],
          },
          {
            id: 10,
            name: "Steel Entry Door",
            category: "doors",
            quantity: 3,
            buyingPrice: 45000,
            sellingPrice: 65000,
            condition: "new",
          },
          {
            id: 11,
            name: "Wooden Dining Table",
            category: "home_interior",
            quantity: 6,
            buyingPrice: 20000,
            sellingPrice: 35000,
            condition: "new",
            sizes: [
              { width: 48, length: 96 },
              { width: 48, length: 120 },
            ],
          },
          {
            id: 12,
            name: "Decorative Mirror",
            category: "home_interior",
            quantity: 22,
            buyingPrice: 2000,
            sellingPrice: 4500,
            condition: "new",
            sizes: [
              { width: 24, length: 36 },
              { width: 36, length: 48 },
              { width: 48, length: 60 },
            ],
          },
          {
            id: 13,
            name: "Folding Door System",
            category: "doors",
            quantity: 4,
            buyingPrice: 25000,
            sellingPrice: 38000,
            condition: "new",
          },
          {
            id: 14,
            name: "Wall Shelves Floating",
            category: "home_interior",
            quantity: 16,
            buyingPrice: 3000,
            sellingPrice: 5500,
            condition: "new",
          },
          {
            id: 15,
            name: "Wooden Bench",
            category: "home_interior",
            quantity: 8,
            buyingPrice: 12000,
            sellingPrice: 18000,
            condition: "new",
          },
        ],
        totalItems: 15,
      },
    };
  },

  getLowStock: async () => {
    await delay(100);
    return {
      success: true,
      data: [
        { id: 2, name: "Steel Door Security", category: "doors", quantity: 8 },
        {
          id: 4,
          name: "Wardrobe Sliding",
          category: "home_interior",
          quantity: 5,
        },
      ],
    };
  },

  // Finance
  getFinanceRecords: async ({ page = 1 }) => {
    await delay(150);
    return {
      success: true,
      data: {
        records: [
          {
            id: 1,
            customerName: "Ahmad Khan",
            amount: 150000,
            paymentStatus: "paid",
            paymentMethod: "cash",
            bankUsed: "CASH",
            bankDirection: "in",
            dueDate: "2024-12-15",
          },
          {
            id: 2,
            customerName: "Ahmad Khan",
            amount: 150000,
            paymentStatus: "pending",
            paymentMethod: "mobile_wallet",
            bankUsed: "JAZZ",
            bankDirection: "in",
            dueDate: "2024-12-15",
          },
          {
            id: 3,
            customerName: "Ahmad Khan",
            amount: 150000,
            paymentStatus: "paid",
            paymentMethod: "bank_transfer",
            bankUsed: "HBL",
            bankDirection: "in",
            dueDate: "2024-12-15",
          },
          {
            id: 4,
            customerName: "Sara Ali",
            amount: 85000,
            paymentStatus: "pending",
            paymentMethod: "cash",
            bankUsed: "CASH",
            bankDirection: "in",
            dueDate: "2024-12-20",
          },
        ],
        // currentPage: page,
        // totalPages: 2,
        totalItems: 35,
      },
    };
  },

  getPendingPayments: async () => {
    await delay(100);
    return {
      success: true,
      data: [
        {
          id: 2,
          customerName: "Sara Ali",
          amount: 85000,
          invoiceNumber: "INV-1002",
        },
      ],
    };
  },

  // Invoices
  getInvoices: async () => {
    await delay(150);
    return {
      success: true,
      data: {
        invoices: [
          // SELLING INVOICES (3)
          {
            id: 1,
            invoiceNumber: "INV-2001",
            name: "Ahmad Khan",
            address: "123 Main Street, Lahore",
            phoneNumber: "+92-300-1234567",
            invoiceType: "selling",
            bankUsed: "HBL",
            paymentMethod: "bank_transfer",
            paymentStatus: "paid",
            paymentProof: null,
            total: 150000,
            subtotal: 140000,
            tax: 10000,
            discount: 0,
            taxRate: 7,
            discountRate: 0,
            shippingCost: 0,
            supplierName: "",
            items: [
              {
                productId: 1,
                productName: "Wooden Door Premium",
                quantity: 2,
                unitPrice: 30000,
                lineTotal: 60000,
              },
              {
                productId: 2,
                productName: "Steel Door Security",
                quantity: 1,
                unitPrice: 80000,
                lineTotal: 80000,
              },
            ],
            notes: "Delivery to be made on 15th Dec",
            date: "2024-12-01",
          },
          {
            id: 2,
            invoiceNumber: "INV-2002",
            name: "Sara Ali",
            address: "456 Park Avenue, Karachi",
            phoneNumber: "+92-301-9876543",
            invoiceType: "selling",
            bankUsed: "CASH",
            paymentMethod: "cash",
            paymentStatus: "pending",
            paymentProof: null,
            total: 85000,
            subtotal: 80000,
            tax: 5000,
            discount: 0,
            taxRate: 6,
            discountRate: 0,
            shippingCost: 0,
            supplierName: "",
            items: [
              {
                productId: 1,
                productName: "Wooden Door Premium",
                quantity: 1,
                unitPrice: 30000,
                lineTotal: 30000,
              },
              {
                productId: 3,
                productName: "Kitchen Cabinet Set",
                quantity: 5,
                unitPrice: 10000,
                lineTotal: 50000,
              },
            ],
            notes: "Customer payment on delivery",
            date: "2024-12-02",
          },
          {
            id: 3,
            invoiceNumber: "INV-2003",
            name: "Fatima Hassan",
            address: "789 Gold Street, Islamabad",
            phoneNumber: "+92-302-5555555",
            invoiceType: "selling",
            bankUsed: "MCB",
            paymentMethod: "bank_transfer",
            paymentStatus: "paid",
            paymentProof: null,
            total: 200000,
            subtotal: 190000,
            tax: 10000,
            discount: 0,
            taxRate: 5,
            discountRate: 0,
            shippingCost: 0,
            supplierName: "",
            items: [
              {
                productId: 2,
                productName: "Steel Door Security",
                quantity: 2,
                unitPrice: 60000,
                lineTotal: 120000,
              },
              {
                productId: 1,
                productName: "Wooden Door Premium",
                quantity: 1,
                unitPrice: 30000,
                lineTotal: 30000,
              },
              {
                productId: 3,
                productName: "Kitchen Cabinet Set",
                quantity: 4,
                unitPrice: 10000,
                lineTotal: 40000,
              },
            ],
            notes: "Premium order - VIP customer",
            date: "2024-12-03",
          },

          // BUYING INVOICES (3)
          {
            id: 4,
            invoiceNumber: "BUY-3001",
            name: "Ahmed Supplier Co.",
            address: "Industrial Area, Sialkot",
            phoneNumber: "+92-320-1111111",
            invoiceType: "buying",
            bankUsed: "MCB",
            paymentMethod: "bank_transfer",
            paymentStatus: "paid",
            paymentProof: null,
            total: 180000,
            subtotal: 170000,
            tax: 10000,
            discount: 0,
            taxRate: 6,
            discountRate: 0,
            shippingCost: 0,
            supplierName: "",
            items: [
              {
                productId: 1,
                productName: "Wooden Door Premium",
                quantity: 5,
                unitPrice: 20000,
                lineTotal: 100000,
              },
              {
                productId: 2,
                productName: "Steel Door Security",
                quantity: 4,
                unitPrice: 17500,
                lineTotal: 70000,
              },
            ],
            notes: "Bulk purchase - Monthly supply",
            date: "2024-12-01",
          },
          {
            id: 5,
            invoiceNumber: "BUY-3002",
            name: "Premium Imports Ltd",
            address: "Port Area, Karachi",
            phoneNumber: "+92-321-2222222",
            invoiceType: "buying",
            bankUsed: "HBL",
            paymentMethod: "bank_transfer",
            paymentStatus: "pending",
            paymentProof: null,
            total: 250000,
            subtotal: 235000,
            tax: 15000,
            discount: 0,
            taxRate: 6,
            discountRate: 0,
            shippingCost: 0,
            supplierName: "",
            items: [
              {
                productId: 2,
                productName: "Steel Door Security",
                quantity: 3,
                unitPrice: 50000,
                lineTotal: 150000,
              },
              {
                productId: 3,
                productName: "Kitchen Cabinet Set",
                quantity: 10,
                unitPrice: 8500,
                lineTotal: 85000,
              },
            ],
            notes: "International supplier - Payment due 30 days",
            date: "2024-12-02",
          },
          {
            id: 6,
            invoiceNumber: "BUY-3003",
            name: "Local Materials House",
            address: "Market Street, Multan",
            phoneNumber: "+92-322-3333333",
            invoiceType: "buying",
            bankUsed: "NPB",
            paymentMethod: "bank_transfer",
            paymentStatus: "paid",
            paymentProof: null,
            total: 120000,
            subtotal: 113000,
            tax: 7000,
            discount: 0,
            taxRate: 6,
            discountRate: 0,
            shippingCost: 0,
            supplierName: "",
            items: [
              {
                productId: 1,
                productName: "Wooden Door Premium",
                quantity: 3,
                unitPrice: 20000,
                lineTotal: 60000,
              },
              {
                productId: 3,
                productName: "Kitchen Cabinet Set",
                quantity: 6,
                unitPrice: 8800,
                lineTotal: 53000,
              },
            ],
            notes: "Regular supplier - Monthly invoice",
            date: "2024-12-04",
          },

          // QUOTATION INVOICES (3)
          {
            id: 7,
            invoiceNumber: "QT-4001",
            name: "Hassan Construction",
            address: "DHA Phase 5, Lahore",
            phoneNumber: "+92-323-4444444",
            invoiceType: "quotation",
            bankUsed: "",
            paymentMethod: null,
            paymentStatus: null,
            paymentProof: null,
            total: 175000,
            subtotal: 165000,
            tax: 10000,
            discount: 0,
            taxRate: 6,
            discountRate: 0,
            shippingCost: 0,
            supplierName: "",
            items: [
              {
                productId: 1,
                productName: "Wooden Door Premium",
                quantity: 2,
                unitPrice: 30000,
                lineTotal: 60000,
              },
              {
                productId: 2,
                productName: "Steel Door Security",
                quantity: 1,
                unitPrice: 60000,
                lineTotal: 60000,
              },
              {
                productId: 3,
                productName: "Kitchen Cabinet Set",
                quantity: 1,
                unitPrice: 10000,
                lineTotal: 10000,
              },
            ],
            notes: "Quotation valid for 30 days",
            date: "2024-12-01",
          },
          {
            id: 8,
            invoiceNumber: "QT-4002",
            name: "Interior Designs Plus",
            address: "Clifton, Karachi",
            phoneNumber: "+92-324-5555555",
            invoiceType: "quotation",
            bankUsed: "",
            paymentMethod: null,
            paymentStatus: null,
            paymentProof: null,
            total: 320000,
            subtotal: 300000,
            tax: 20000,
            discount: 0,
            taxRate: 7,
            discountRate: 0,
            shippingCost: 0,
            supplierName: "",
            items: [
              {
                productId: 2,
                productName: "Steel Door Security",
                quantity: 3,
                unitPrice: 60000,
                lineTotal: 180000,
              },
              {
                productId: 1,
                productName: "Wooden Door Premium",
                quantity: 2,
                unitPrice: 30000,
                lineTotal: 60000,
              },
              {
                productId: 3,
                productName: "Kitchen Cabinet Set",
                quantity: 6,
                unitPrice: 10000,
                lineTotal: 60000,
              },
            ],
            notes: "Commercial project - Bulk discount available",
            date: "2024-12-02",
          },
          {
            id: 9,
            invoiceNumber: "QT-4003",
            name: "Urban Living Concepts",
            address: "F-7 Markaz, Islamabad",
            phoneNumber: "+92-325-6666666",
            invoiceType: "quotation",
            bankUsed: "",
            paymentMethod: null,
            paymentStatus: null,
            paymentProof: null,
            total: 95000,
            subtotal: 90000,
            tax: 5000,
            discount: 0,
            taxRate: 5,
            discountRate: 0,
            shippingCost: 0,
            supplierName: "",
            items: [
              {
                productId: 3,
                productName: "Kitchen Cabinet Set",
                quantity: 9,
                unitPrice: 10000,
                lineTotal: 90000,
              },
            ],
            notes: "Small residential project",
            date: "2024-12-03",
          },

          // DROPSHIPPING INVOICES (3)
          {
            id: 10,
            invoiceNumber: "DROP-5001",
            name: "Ali Raza",
            address: "Gulshan-e-Iqbal, Karachi",
            phoneNumber: "+92-326-7777777",
            invoiceType: "dropshipping",
            bankUsed: "JAZZ",
            paymentMethod: "mobile_wallet",
            paymentStatus: "paid",
            paymentProof: null,
            total: 8500,
            subtotal: 8000,
            tax: 500,
            discount: 0,
            taxRate: 6,
            discountRate: 0,
            shippingCost: 500,
            supplierName: "Express Logistics",
            items: [
              {
                productId: 1,
                productName: "Wooden Door Premium",
                quantity: 1,
                unitPrice: 30000,
                lineTotal: 30000,
              },
            ],
            notes: "Shipped via Express Logistics",
            date: "2024-12-01",
          },
          {
            id: 11,
            invoiceNumber: "DROP-5002",
            name: "Zainab Khan",
            address: "Defence, Lahore",
            phoneNumber: "+92-327-8888888",
            invoiceType: "dropshipping",
            bankUsed: "HBL",
            paymentMethod: "bank_transfer",
            paymentStatus: "pending",
            paymentProof: null,
            total: 16800,
            subtotal: 16000,
            tax: 800,
            discount: 0,
            taxRate: 5,
            discountRate: 0,
            shippingCost: 800,
            supplierName: "TCS Courier",
            items: [
              {
                productId: 2,
                productName: "Steel Door Security",
                quantity: 1,
                unitPrice: 60000,
                lineTotal: 60000,
              },
              {
                productId: 3,
                productName: "Kitchen Cabinet Set",
                quantity: 1,
                unitPrice: 10000,
                lineTotal: 10000,
              },
            ],
            notes: "Pending shipment - Scheduled for 12th Dec",
            date: "2024-12-05",
          },
          {
            id: 12,
            invoiceNumber: "DROP-5003",
            name: "Muhammad Hassan",
            address: "Johar Town, Lahore",
            phoneNumber: "+92-328-9999999",
            invoiceType: "dropshipping",
            bankUsed: "NPB",
            paymentMethod: "bank_transfer",
            paymentStatus: "paid",
            paymentProof: null,
            total: 12600,
            subtotal: 12000,
            tax: 600,
            discount: 0,
            taxRate: 5,
            discountRate: 0,
            shippingCost: 600,
            supplierName: "Daewoo Express",
            items: [
              {
                productId: 1,
                productName: "Wooden Door Premium",
                quantity: 2,
                unitPrice: 30000,
                lineTotal: 60000,
              },
            ],
            notes: "Shipped via Daewoo Express - Tracking #EXP123456",
            date: "2024-12-04",
          },
        ],
        // currentPage: page,
        // totalPages: 2,
        totalItems: 42,
      },
    };
  },

  // Projects
  getProjects: async ({ page = 1 }) => {
    await delay(150);
    return {
      success: true,
      data: {
        projects: [
          {
            id: 1,
            projectName: "Kitchen Renovation",
            siteLocation: "DHA Phase 5, Lahore",
            customerName: "Fatima Ahmed",
            workerAssigned: "Usman Ali",
            status: "completed",
            customerLabourCost: 6500,
            workerPayment: 4000,
          },
          {
            id: 2,
            projectName: "Kitchen Renovation",
            siteLocation: "DHA Phase 5, Lahore",
            customerName: "Fatima Ahmed",
            workerAssigned: "Usman Ali",
            status: "in_progress",
            customerLabourCost: 4500,
            workerPayment: 4000,
          },
          {
            id: 3,
            projectName: "Home interior",
            siteLocation: "DHA Phase 5, Lahore",
            customerName: "Fatima Ahmed",
            workerAssigned: "Usman Ali",
            status: "in_progress",
            customerLabourCost: 6000,
            workerPayment: 5300,
          },
          {
            id: 4,
            projectName: "2 Doors",
            siteLocation: "DHA Phase 5, Lahore",
            customerName: "Fatima Ahmed",
            workerAssigned: "Usman Ali",
            status: "completed",
            customerLabourCost: 8500,
            workerPayment: 6300,
          },
        ],
        // currentPage: page,
        // totalPages: 4,
        totalItems: 85,
      },
    };
  },

  lowStock: async ({ page = 1 }) => {
    await delay(10);
    return {
      success: true,
      data: {
        items: [
          {
            id: 1,
            name: "Door1",
            category: "Doors",
            quantity: 3,
          },
          {
            id: 2,
            name: "Door2",
            category: "Doors",
            quantity: 3,
          },
          {
            id: 3,
            name: "Door2",
            category: "Doors",
            quantity: 3,
          },
        ],
      },
    };
  },

  // Dropshipping
  getDropshippingOrders: async ({ page = 1 }) => {
    await delay(150);
    return {
      success: true,
      data: {
        orders: [
          {
            id: 1,
            productName: "Smart Door Lock",
            customerName: "Ali Raza",
            purchasePrice: 5000,
            salePrice: 8000,
            shippingCost: 500,
            profit: 2500,
            status: "paid",
            orderDate: "2024-12-10",
          },
          {
            id: 2,
            productName: "Smart Door Lock",
            customerName: "Ali Raza",
            purchasePrice: 5000,
            salePrice: 8000,
            shippingCost: 500,
            profit: 2500,
            status: "pending",
            orderDate: "2024-12-10",
          },
          {
            id: 3,
            productName: "Smart Door Lock",
            customerName: "Ali Raza",
            purchasePrice: 5000,
            salePrice: 8000,
            shippingCost: 500,
            profit: 2500,
            status: "pending",
            orderDate: "2024-12-10",
          },
          {
            id: 4,
            productName: "Smart Door Lock",
            customerName: "Ali Raza",
            purchasePrice: 5000,
            salePrice: 8000,
            shippingCost: 500,
            profit: 2500,
            status: "pending",
            orderDate: "2024-12-10",
          },
        ],
        // currentPage: page,
        // totalPages: 3,
        totalItems: 50,
      },
    };
  },

  // Investments
  getInvestments: async ({ page = 1 }) => {
    await delay(150);
    return {
      success: true,
      data: {
        investments: [
          {
            id: 1,
            investmentName: "Imported Door Batch",
            productName: "Premium Doors",
            amountInvested: 500000,
            currentValue: 650000,
            profit: 150000,
            roi: 30,
            investmentDate: "2024-11-01",
          },
          {
            id: 2,
            investmentName: "Imported Door Batch",
            productName: "Premium Doors",
            amountInvested: 500000,
            currentValue: 350000,
            profit: -150000,
            roi: -30,
            investmentDate: "2024-11-01",
          },
          {
            id: 3,
            investmentName: "Imported Door Batch",
            productName: "Premium Doors",
            amountInvested: 500000,
            currentValue: 650000,
            profit: 150000,
            roi: 30,
            investmentDate: "2024-11-01",
          },
          {
            id: 4,
            investmentName: "Imported Door Batch",
            productName: "Premium Doors",
            amountInvested: 500000,
            currentValue: 650000,
            profit: 150000,
            roi: 30,
            investmentDate: "2024-11-01",
          },
          {
            id: 5,
            investmentName: "Imported Door Batch",
            productName: "Premium Doors",
            amountInvested: 500000,
            currentValue: 450000,
            profit: -50000,
            roi: -20,
            investmentDate: "2024-11-01",
          },
        ],
        // currentPage: page,
        // totalPages: 2,
        totalItems: 45,
      },
    };
  },

  // Expenses
  getExpenses: async ({ page = 1, category = "" }) => {
    await delay(150);
    return {
      success: true,
      data: {
        expenses: [
          {
            id: 1,
            expenseName: "Office Rent - December",
            category: "rent",
            amount: 50000,
            paymentMethod: "bank_transfer",
            expenseDate: "2024-12-01",
          },
          {
            id: 2,
            expenseName: "Electricity Bill",
            category: "bills",
            amount: 15000,
            paymentMethod: "cash",
            expenseDate: "2024-12-05",
          },
          {
            id: 3,
            expenseName: "Electricity Bill",
            category: "transport",
            amount: 15000,
            paymentMethod: "cash",
            expenseDate: "2024-12-05",
          },
          {
            id: 4,
            expenseName: "Electricity Bill",
            category: "purchasing",
            amount: 15000,
            paymentMethod: "cash",
            expenseDate: "2024-12-05",
          },
        ],
        // currentPage: page,
        // totalPages: 2,
        totalItems: 45,
      },
    };
  },
};

// Use this in your Redux slices instead of real API calls
export default mockApi;
