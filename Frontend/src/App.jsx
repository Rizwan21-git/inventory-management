import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "./slices/authSlice";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";

// lazy loadung
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Inventory = lazy(() => import("./pages/Inventory/Inventory"));
const Finance = lazy(() => import("./pages/Finance/Finance"));
const Quotation = lazy(() => import("./pages/Quotation/Quotation"));
const Invoice = lazy(() => import("./pages/Invoice/Invoice"));
const Projects = lazy(() => import("./pages/Projects/Projects"));
const Dropshipping = lazy(() => import("./pages/Dropshipping/Dropshipping"));
const Investment = lazy(() => import("./pages/Investment/Investment"));
const Expenses = lazy(() => import("./pages/Expenses/Expenses"));
const ShopManagement = lazy(() => import("./pages/shopManagement/shopmanagement"));
const Login = lazy(() => import("./pages/Auth/Login"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser());
    } else {
      navigate("/login");
    }
  }, [dispatch, token]);

  // Determine home page based on user role
  const getHomePage = () => {
    const userRole = user?.userType || user?.type || user?.role;
    if (userRole === "admin") {
      return <Dashboard />;
    } else if (userRole === "shop") {
      return <Inventory />;
    }
    return <Dashboard />; // fallback
  };

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Home route - role-based redirect */}
          <Route
            index
            element={
              <ProtectedRoute>
                {getHomePage()}
              </ProtectedRoute>
            }
          />

          {/* Dashboard - Admin only */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Inventory - Both Admin and Shop */}
          <Route
            path="inventory"
            element={
              <ProtectedRoute allowedRoles={["admin", "shop"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />

          {/* Finance - Admin only */}
          <Route
            path="finance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Finance />
              </ProtectedRoute>
            }
          />

          {/* Invoices - Both Admin and Shop */}
          <Route
            path="invoices"
            element={
              <ProtectedRoute allowedRoles={["admin", "shop"]}>
                <Invoice />
              </ProtectedRoute>
            }
          />

          {/* Quotations - Both Admin and Shop */}
          <Route
            path="quotation"
            element={
              <ProtectedRoute allowedRoles={["admin", "shop"]}>
                <Quotation />
              </ProtectedRoute>
            }
          />

          {/* Projects - Both Admin and Shop */}
          <Route
            path="projects"
            element={
              <ProtectedRoute allowedRoles={["admin", "shop"]}>
                <Projects />
              </ProtectedRoute>
            }
          />

          {/* Dropshipping - Admin only */}
          <Route
            path="dropshipping"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dropshipping />
              </ProtectedRoute>
            }
          />

          {/* Investment - Admin only */}
          <Route
            path="investment"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Investment />
              </ProtectedRoute>
            }
          />

          {/* Expenses - Both Admin and Shop */}
          <Route
            path="expenses"
            element={
              <ProtectedRoute allowedRoles={["admin", "shop"]}>
                <Expenses />
              </ProtectedRoute>
            }
          />

          {/* Shop Management - Admin only */}
          <Route
            path="shopManagement"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ShopManagement />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
