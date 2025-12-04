import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "./slices/authSlice";
import Layout from "./components/layout/Layout";
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
const ShopManagement = lazy(() =>
  import("./pages/shopManagement/shopmanagement")
);
const Login = lazy(() => import("./pages/Auth/Login"));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // if (loading) {
  //   return <LoadingSpinner fullScreen />;
  // }

  // return isAuthenticated ? children : <Navigate to="/login" replace />;
  return children;
};

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser());
    } else {
      navigate("/login");
    }
  }, [dispatch, token]);

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance"
            element={
              <ProtectedRoute>
                <Finance />
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices"
            element={
              <ProtectedRoute>
                <Invoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="quotation"
            element={
              <ProtectedRoute>
                <Quotation />
              </ProtectedRoute>
            }
          />
          <Route
            path="projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="dropshipping"
            element={
              <ProtectedRoute>
                <Dropshipping />
              </ProtectedRoute>
            }
          />
          <Route
            path="investment"
            element={
              <ProtectedRoute>
                <Investment />
              </ProtectedRoute>
            }
          />
          <Route
            path="expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="shopManagement"
            element={
              <ProtectedRoute>
                <ShopManagement />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Suspense>
  );
}

export default App;
