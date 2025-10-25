import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingComponent from "../components/LoadingComponent"; // Optional: if checking takes time

const ProtectedRoute = ({ allowedRoles }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (authState.isLoading) {
    return <LoadingComponent message="Verifying access..." />;
  }

  // Check if authenticated
  if (!authState.isAuthenticated) {
    console.log("Redirecting to /unauthorized (not authenticated)");
    // Redirect them to the unauthorized page, passing the intended location
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Check if the user's role is allowed (if allowedRoles are specified)
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(authState.role)
  ) {
    console.log(
      `Redirecting to /unauthorized (Role ${
        authState.role
      } not in ${allowedRoles.join(",")})`
    );
    // Redirect if the role is not permitted for this route
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
