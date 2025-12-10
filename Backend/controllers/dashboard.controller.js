import asyncHandler from "express-async-handler";
import { Invoice } from "../models/invoiceSchema.js";
import { Product } from "../models/productSchema.js";
import { Expense } from "../models/expenseSchema.js";
import { Project } from "../models/projectSchema.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { period = "this_year", year, month } = req.query;
  const currentYear = new Date().getFullYear();
  const targetYear = year ? parseInt(year) : currentYear;

  // Build date filter
  let dateFilter = {};
  if (period === "this_year") {
    dateFilter.createdAt = {
      $gte: new Date(targetYear, 0, 1),
      $lt: new Date(targetYear, 12, 1),
    };
    if (month && month !== "all") {
      const monthNum = parseInt(month);
      dateFilter.createdAt = {
        $gte: new Date(targetYear, monthNum - 1, 1),
        $lt: new Date(targetYear, monthNum, 1),
      };
    }
  } else if (period === "year") {
    dateFilter.createdAt = {
      $gte: new Date(targetYear, 0, 1),
      $lt: new Date(targetYear, 12, 1),
    };
  }

  try {
    // Get all invoices for the period
    const invoices = await Invoice.find(dateFilter);

    // Separate by type
    const sellingInvoices = invoices.filter(
      (inv) => inv.invoiceType === "selling"
    );
    const investmentInvoices = invoices.filter(
      (inv) => inv.invoiceType === "buying"
    );
    const dropshippingInvoices = invoices.filter(
      (inv) => inv.invoiceType === "dropshipping"
    );

    // 1. Calculate Total Revenue (sum of "total" from selling + dropshipping)
    const totalRevenue = sellingInvoices.reduce(
      (sum, inv) => sum + (inv.total || 0),
      0
    ) + dropshippingInvoices.reduce(
      (sum, inv) => sum + (inv.total || 0),
      0
    );

    // 2. Calculate Total Investment (sum of "total" where invoiceType is "buying")
    const totalInvestment = investmentInvoices.reduce(
      (sum, inv) => sum + (inv.total || 0),
      0
    );

    // 3. Calculate Gross Profit (sum of profit from invoices + sum of profit from projects)
    const invoiceProfitTotal = sellingInvoices.reduce(
      (sum, inv) => sum + (inv.profit || 0),
      0
    ) + dropshippingInvoices.reduce(
      (sum, inv) => sum + (inv.profit || 0),
      0
    );

    // Get projects for the period
    const projects = await Project.find(dateFilter);
    const projectProfit = projects.reduce(
      (sum, proj) => sum + (proj.profit || 0),
      0
    );

    const grossProfit = invoiceProfitTotal + projectProfit;

    // 4. Calculate Total Expenses (sum from expenses database)
    const expenses = await Expense.find(dateFilter);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // 5. Calculate Net Profit (gross profit - expenses)
    const netProfit = grossProfit - totalExpenses;

    // Get inventory stats
    const allProducts = await Product.find();
    const doorProducts = allProducts.filter((p) => p.category === "doors");
    const interiorProducts = allProducts.filter(
      (p) => p.category === "home_interior"
    );

    const doorsOutOfStock = doorProducts.filter((p) => p.quantity === 0).length;
    const doorsLowStock = doorProducts.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
    // 'In stock' here means sufficiently stocked (quantity > low-stock threshold)
    const doorsInStock = doorProducts.filter((p) => p.quantity > 10).length;
    // Total items considered for the section: inStock + lowStock (exclude out-of-stock)
    const doorsCount = doorsInStock + doorsLowStock;

    const interiorOutOfStock = interiorProducts.filter((p) => p.quantity === 0).length;
    const interiorLowStock = interiorProducts.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
    const interiorInStock = interiorProducts.filter((p) => p.quantity > 10).length;
    // Total items considered for the section: inStock + lowStock (exclude out-of-stock)
    const interiorCount = interiorInStock + interiorLowStock + interiorOutOfStock;

    // Calculate monthly revenue breakdown (selling + dropshipping only)
    const monthly = [];
    for (let m = 1; m <= 12; m++) {
      const startDate = new Date(targetYear, m - 1, 1);
      const endDate = new Date(targetYear, m, 1);
      const monthInvoices = invoices.filter(
        (inv) =>
          new Date(inv.createdAt) >= startDate &&
          new Date(inv.createdAt) < endDate
      );
      const monthRevenue = monthInvoices
        .filter((inv) => inv.invoiceType === "selling" || inv.invoiceType === "dropshipping")
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
      monthly.push({
        month: m,
        revenue: monthRevenue,
      });
    }

    // Recent pending payments (from invoices in period) - show a small list for dashboard
    const pendingPayments = invoices
      .filter((inv) => inv.paymentStatus === "pending")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((inv) => ({
        _id: inv._id,
        invoiceNumber: inv.invoiceNumber,
        name: inv.name || inv.customerName || "",
        total: inv.total || 0,
        paymentStatus: inv.paymentStatus,
        createdAt: inv.createdAt,
      }));

    res.json({
      kpis: {
        totals: {
          totalRevenue,
          totalInvestment,
          grossProfit,
          totalExpenses,
          netProfit,
        },
        monthly,
      },
      pendingPayments,
      doorsCount,
      doorsInStock,
      doorsLowStock,
      doorsOutOfStock,
      interiorCount,
      interiorInStock,
      interiorLowStock,
      interiorOutOfStock,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch dashboard stats");
  }
});

export const getAvailableYears = asyncHandler(async (req, res) => {
  try {
    // Get all unique years from invoices
    const invoices = await Invoice.find({}, { createdAt: 1 });
    const years = new Set();
    invoices.forEach((inv) => {
      years.add(new Date(inv.createdAt).getFullYear());
    });

    // Also include current year
    years.add(new Date().getFullYear());

    // Convert to sorted array
    const yearArray = Array.from(years).sort((a, b) => b - a);

    res.json(yearArray);
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch available years");
  }
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  try {
    // Get recent invoices
    const recentInvoices = await Invoice.find({_id: 0, invoiceNumber : 1, name: 1, total: 1, paymentStatus: 1})
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(recentInvoices);
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch recent activity");
  }
});
