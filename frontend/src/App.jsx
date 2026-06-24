import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Investigation from './pages/Investigation';
import IntelPackage from './pages/IntelPackage';

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/investigation" element={<Investigation />} />
              <Route path="/packages" element={<IntelPackage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
