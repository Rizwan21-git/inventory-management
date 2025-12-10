import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "./LoadingSpinner";

/**
 * ProtectedRoute component to enforce authentication and role-based access control
 * @param {React.ReactNode} children - Component to render if access is granted
 * @param {string[]} allowedRoles - Array of roles allowed to access (e.g., ['admin', 'shop'])
 * @param {string} requiredPage - Optional: specific page/permission required
 */
const ProtectedRoute = ({ children, allowedRoles = null, requiredPage = null }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  // Show loading spinner while auth check is in progress
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && user) {
    const userRole = user.userType || user.type || user.role;
    if (!allowedRoles.includes(userRole)) {
      // Redirect to home or dashboard if access denied
      return <Navigate to="/" replace />;
    }
  }

  // Check specific page permission if required
  if (requiredPage && user?.permissions) {
    if (!user.permissions[requiredPage]) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
