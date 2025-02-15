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

import ProtectedRoute from './Components/ProtectedRoute';
import ManageAccounts from './Pages/ManageAccounts';
import ActivityLogs from './Pages/ActivityLogs';
import ExcelUploader from './Components/ExcelUploader';
import CheckInOut from './Pages/CheckInOut';
import ItemsToPromote from './Pages/ItemsToPromote';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />

        {/* Admin or SuperAdmin can access these */}
        <Route
          path="/contacts"
          element={
            
              <Contacts />
            
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
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <ManageAccounts />
              </ProtectedRoute>
          }
        />
        <Route
          path="/Checkinout"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <CheckInOut />
              </ProtectedRoute>
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
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <ActivityLogs />
              </ProtectedRoute>
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
        <Route
          path="/Itemstopromote"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <ItemsToPromote />
            </ProtectedRoute>
          }
        />

      
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
