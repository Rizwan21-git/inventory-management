import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiPackage,
  FiDollarSign,
  FiFileText,
  FiBriefcase,
  FiTruck,
  FiTrendingUp,
  FiCreditCard,
  FiShoppingBag,
} from "react-icons/fi";

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { path: "/", label: "Dashboard", icon: FiHome },
    { path: "/inventory", label: "Inventory", icon: FiPackage },
    { path: "/finance", label: "Finance", icon: FiDollarSign },
    { path: "/invoices", label: "Invoices", icon: FiFileText },
    { path: "/quotation", label: "Quotations", icon: FiFileText },
    { path: "/projects", label: "Projects", icon: FiBriefcase },
    { path: "/dropshipping", label: "Dropshipping", icon: FiTruck },
    { path: "/investment", label: "Investment", icon: FiTrendingUp },
    { path: "/expenses", label: "Expenses", icon: FiCreditCard },
    { path: "/shopManagement", label: "Shop Management", icon: FiShoppingBag },
  ];

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0, width: isOpen ? 256 : 80 }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-30 ${
        window.innerWidth < 768 && { width: 0 }
      }`}
    >
      <div className="p-1 border-b border-gray-200">
        <motion.div
          animate={{ scale: isOpen ? 1 : 0.8 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-lg font-bold text-gray-900">Business</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      <nav className="p-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 border-b border-gray-150 transition-all  duration-200 group ${
                isActive
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-primary-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
