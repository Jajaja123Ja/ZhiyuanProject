import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuthContext();

  // If not logged in, redirect to Login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user's role is in the allowedRoles prop
  if (!allowedRoles.includes(user.Perms)) {
    // If a "REGS" tries to go to an ADMIN route, for example, redirect them somewhere
    return <Navigate to="/InventoryTracker" />;
  }

  // If role is allowed, render the protected component
  return children;
};

export default ProtectedRoute;
