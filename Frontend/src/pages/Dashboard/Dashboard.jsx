import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiPackage,
  FiDollarSign,
  FiFileText,
  FiBriefcase,
  FiAlertCircle,
  FiTrendingUp,
  FiShoppingBag,
  FiHome,
} from "react-icons/fi";
import { fetchDashboardStats, fetchAvailableYears } from "../../slices/dashboardSlice";
import { fetchLowStock } from "../../slices/inventorySlice";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatCurrency, formatCompactCurrency } from "../../utils/helpers";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, loading } = useSelector((state) => state.dashboard);
  const { lowStockItems } = useSelector((state) => state.inventory);

  // available years come directly from API (only show years available in DB)
  const availableYears = useSelector((state) => state.dashboard.availableYears) || [];

  // UI state for KPI time selection
  const [timeRange, setTimeRange] = useState({
    period: "this_year", 
    year: new Date().getFullYear(),
    month: "all",
  });

  useEffect(() => {
    // load default KPIs for this year
    const year = new Date().getFullYear();
    dispatch(fetchDashboardStats({ period: "this_year", year }));
    dispatch(fetchAvailableYears());
    dispatch(fetchLowStock({}));
  }, [dispatch]);

  // When the available years list is loaded, ensure year selection is valid
  useEffect(() => {
    if (timeRange.period === "year" && availableYears.length > 0) {
      if (!availableYears.includes(timeRange.year)) {
        const targetYear = availableYears[0];
        setTimeRange((prev) => ({ ...prev, year: targetYear }));
        // fetch kpis for the selected year
        dispatch(fetchDashboardStats({ period: "year", year: targetYear }));
      }
    }
  }, [availableYears, timeRange.period, timeRange.year, dispatch]);

  const onTimeRangeChange = async (next) => {
    const newRange = { ...timeRange, ...next };
    setTimeRange(newRange);
    // request KPIs for the selected range
    dispatch(
      fetchDashboardStats({
        period: newRange.period,
        year: newRange.year,
        month: newRange.month,
      })
    );
  };
  
  const pendingPayments = stats?.pendingPayments || [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex mb-4 items-center gap-2">
            <FiPackage className="text-primary-600" />
            Dashboard
          </h1>
          <p className="text-gray-600 text-sm md:text-xl mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
      </motion.div>

      <div className="mt-6 mb-6 space-y-6">
        <Card className="p-4 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
              <p className="text-sm text-gray-600">View KPIs for</p>

              <select
                value={timeRange.period}
                onChange={(e) =>
                  onTimeRangeChange({ period: e.target.value, month: "all" })
                }
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 shadow-sm transition-all"
              >
                <option value="this_year">This Year (monthly)</option>
                <option value="year">Specific Year</option>
              </select>

              {timeRange.period === "year" && (
                <select
                  value={timeRange.year}
                  onChange={(e) =>
                    onTimeRangeChange({ year: Number(e.target.value) })
                  }
                  className="px-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 shadow-sm transition-all"
                  disabled={availableYears.length === 0}
                >
                  {availableYears.length === 0 ? (
                    <option value="">No years available</option>
                  ) : (
                    availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))
                  )}
                </select>
              )}

              {timeRange.period === "this_year" && (
                <select
                  value={timeRange.month}
                  onChange={(e) => onTimeRangeChange({ month: e.target.value })}
                  className="px-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 shadow-sm transition-all"
                >
                  <option value="all">All months</option>
                  {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ].map((m, i) => (
                    <option key={i} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Current Selection Display */}
            <div className="text-sm text-gray-500 mt-2 md:mt-0">
              Showing KPIs for:{" "}
              <strong className="text-gray-900">
                {timeRange.period === "this_year"
                  ? `${timeRange.year} — ${
                      timeRange.month === "all"
                        ? "All months"
                        : `Month ${timeRange.month}`
                    }`
                  : timeRange.year}
              </strong>
            </div>
          </div>
        </Card>

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 ">
          {/* Financial Overview Card */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-2xl shadow-sm p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-semibold">
                  Financial Overview
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Totals for the selected period
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {loading ? "Loading..." : `Period: ${timeRange.year}`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {/* Card Item */}
              {[
                {
                  label: "Total Revenue",
                  value: stats?.kpis?.totals?.totalRevenue || 0,
                  icon: FiDollarSign,
                  color: "green-600",
                  bgColor: "green-50",
                },
                {
                  label: "Total Investment",
                  value: stats?.kpis?.totals?.totalInvestment || 0,
                  icon: FiBriefcase,
                  color: "primary-600",
                  bgColor: "primary-50",
                },
                {
                  label: "Gross Profit",
                  value: stats?.kpis?.totals?.grossProfit || 0,
                  icon: FiTrendingUp,
                  color: "indigo-700",
                  bgColor: "indigo-50",
                },
                {
                  label: "Total Expenses",
                  value: stats?.kpis?.totals?.totalExpenses || 0,
                  icon: FiFileText,
                  color: "red-700",
                  bgColor: "red-50",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100"
                >
                  <div
                    className={`p-3 rounded-lg bg-${item.bgColor} text-${item.color} flex items-center justify-center`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div
                      className={`text-sm md:text-lg font-bold text-${item.color} mt-1 truncate`}
                    >
                      {formatCompactCurrency(item.value)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Net Profit */}
            <div className="mt-4 p-4 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Net Profit</div>
                <div
                  className={`text-xl md:text-2xl lg:text-3xl font-extrabold mt-1 ${
                    (stats?.kpis?.totals?.netProfit || 0) >= 0
                      ? "text-primary-600"
                      : "text-danger-600"
                  }`}
                >
                  {formatCompactCurrency(stats?.kpis?.totals?.netProfit || 0)}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Alerts Section */}
      <div
        className={`grid grid-cols-1 ${
          lowStockItems?.length != 0 &&
          pendingPayments?.length != 0 &&
          "lg:grid-cols-2"
        } mb-9  gap-6`}
      >
        {/* Low Stock Alert */}
        {lowStockItems?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate("/inventory?show=low_stock")}
            className="cursor-pointer"
          >
            <Card
              title="Low Stock Alert"
              className="border-l-4 border-danger-500"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {lowStockItems
                    ?.slice(
                      0,
                      lowStockItems.length > 3 ? 3 : lowStockItems.length
                    )
                    .map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-3 bg-danger-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FiAlertCircle className="w-5 h-5 text-danger-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>
                          </div>
                        </div>
                        <span className="text-danger-700 font-semibold">
                          {item.quantity} left
                        </span>
                      </motion.div>
                    ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-3 bg-danger-50 rounded-lg text-sm text-danger-700 font-semibold hover:bg-danger-100 transition-colors"
                  >
                    Click to view more details
                  </motion.div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Pending Payments */}
        {pendingPayments?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate("/finance?paymentStatus=pending")}
          >
            <Card
              title="Pending Payments"
              className="border-l-4 border-warning-500"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {pendingPayments.map((payment) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 bg-warning-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.name}
                        </p>
                      </div>
                      <span className="text-danger-700 font-semibold">
                        {formatCurrency(payment.total)}
                      </span>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-3 bg-warning-50 rounded-lg text-sm text-warning-700 font-semibold hover:bg-warning-100 transition-colors"
                  >
                    Click to view more details
                  </motion.div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>

      {/* Quick Access Categories - Clickable with 3D effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Doors Section */}
        <motion.div
          whileHover={{
            scale: 1.01,
            rotateY: 0,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => navigate("/inventory?category=doors")}
          className="cursor-pointer"
        >
          <Card
            title="Doors Section"
            subtitle="Quick access to door products"
            hoverable
            className="relative overflow-hidden"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <motion.div
                  className="absolute top-4 right-4"
                  whileHover={{ rotate: 360, scale: 1.3 }}
                  transition={{ duration: 0.6 }}
                >
                  <FiShoppingBag className="w-12 h-12 text-primary-200 opacity-50" />
                </motion.div>
                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Products</span>
                    <span className="font-semibold">
                      {stats?.doorsCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">In Stock</span>
                    <span className="font-semibold text-success-600">
                      {stats?.doorsInStock || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Low Stock</span>
                    <span className="font-semibold text-danger-600">
                      {stats?.doorsLowStock || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Out of Stock</span>
                    <span className="font-semibold text-danger-700">
                      {stats?.doorsOutOfStock || 0}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-500" />
              </>
            )}
          </Card>
        </motion.div>

        {/* Home Interior Section */}
        <motion.div
          whileHover={{
            scale: 1.01,
            rotateY: 0,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => navigate("/inventory?category=home_interior")}
          className="cursor-pointer"
        >
          <Card
            title="Home Interior Section"
            subtitle="Quick access to interior products"
            hoverable
            className="relative overflow-hidden mb-6"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <motion.div
                  className="absolute top-4 right-4"
                  whileHover={{ rotate: -180, scale: 1.3 }}
                  transition={{ duration: 0.6 }}
                >
                  <FiHome className="w-12 h-12 text-purple-200 opacity-50" />
                </motion.div>
                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Products</span>
                    <span className="font-semibold">
                      {stats?.interiorCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">In Stock</span>
                    <span className="font-semibold text-success-600">
                      {stats?.interiorInStock || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Low Stock</span>
                    <span className="font-semibold text-danger-600">
                      {stats?.interiorLowStock || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Out of Stock</span>
                    <span className="font-semibold text-danger-700">
                      {stats?.interiorOutOfStock || 0}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500" />
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Dashboard;
