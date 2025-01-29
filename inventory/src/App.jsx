import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import Homepage from './Pages/Homepage'
import Login from './Pages/Login';
import Materials from './Pages/Materials';
import { CssBaseline } from '@mui/material';

function App() {

  return (
    <>
     <CssBaseline />
    <Routes>

    <Route path="/login" element={<Login />} />
    <Route path="/Materials" element={<Materials />} />
      <Route path="/" element={<Homepage />} />
      </Routes>
    </>
  )
}

export default App
