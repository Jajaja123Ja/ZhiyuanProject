import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, authIsReady } = useAuthContext();
  
    // If we haven't finished loading the user from localStorage, don't render yet
    if (!authIsReady) {
      return <div>Loading...</div>; 
    }
  
    if (!user) {
      return <Navigate to="/login" />;
    }
    if (!allowedRoles.includes(user.Perms)) {
      return <Navigate to="/InventoryTracker" />;
    }
  
    return children;
  };
  

export default ProtectedRoute;
