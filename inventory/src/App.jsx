import { Routes, Route } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import Login from './Pages/Login';
import Materials from './Pages/Materials';
import Contacts from './Pages/Contacts';
import TopSellingProduct from './Pages/TopSellingProduct';
import Reports from './Pages/Reports';
import InventoryTracker from './Pages/InventoryTracker';
import Dashboard from './Pages/Dashboard';
import { CssBaseline } from '@mui/material';

// Our custom ProtectedRoute
import ProtectedRoute from './Components/ProtectedRoute';
import ManageAccounts from './Pages/ManageAccounts';
import ActivityLogs from './Pages/ActivityLogs';
import ExcelUploader from './Components/ExcelUploader';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />

        {/* Admin or SuperAdmin can access these */}
        <Route
          path="/contacts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <Contacts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/Accounts"
          element={
            
              <ManageAccounts />
            
          }
        />
        <Route
          path="/Upload"
          element={
            
              <ExcelUploader />
            
          }
        />
        <Route
          path="/Logs"
          element={
            
              <ActivityLogs />
            
          }
        />
        <Route
          path="/Reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/SellingProduct"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <TopSellingProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Materials"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <Materials />
            </ProtectedRoute>
          }
        />

        {/* REGULAR user routes (plus ADMIN, SUPERADMIN) */}
        <Route
          path="/InventoryTracker"
          element={
            <ProtectedRoute allowedRoles={['REGS', 'ADMIN', 'SUPERADMIN']}>
              <InventoryTracker />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}

export default App;
