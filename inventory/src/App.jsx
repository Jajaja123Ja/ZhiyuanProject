import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import Homepage from './Pages/Homepage'
import Login from './Pages/Login';
import Materials from './Pages/Materials';
import { CssBaseline } from '@mui/material';
import Contacts from './Pages/Contacts';
import TopSellingProduct from './Pages/TopSellingProduct';
import Reports from './Pages/Reports';
import InventoryTracker from './Pages/InventoryTracker';
import Dashboard from './Pages/Dashboard';

function App() {

  return (
    <>
     <CssBaseline />
    <Routes>

    <Route path="/contacts" element={<Contacts />} />
    <Route path="/InventoryTracker" element={<InventoryTracker />} />
    <Route path="/Dashboard" element={<Dashboard />} />
    <Route path="/Reports" element={<Reports />} />
    <Route path="/SellingProduct" element={<TopSellingProduct />} />
    <Route path="/login" element={<Login />} />
    <Route path="/Materials" element={<Materials />} />
      <Route path="/" element={<Homepage />} />
      </Routes>
    </>
  )
}

export default App
