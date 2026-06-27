import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Investigation from './pages/Investigation';
import IntelPackage from './pages/IntelPackage';
import { Toaster } from 'react-hot-toast';
import { MapProvider } from './context/MapContext';

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <div className="flex-1 overflow-auto">
            <MapProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: '#191C24',
                    color: '#E8E6E0',
                    border: '1px solid #252830',
                    borderRadius: 10,
                    fontSize: 13,
                    maxWidth: 420,
                  },
                  success: {
                    iconTheme: { primary: '#1DB87A', secondary: '#191C24' },
                  },
                }}
              />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/investigation" element={<Investigation />} />
                <Route path="/packages" element={<IntelPackage />} />
              </Routes>
            </MapProvider>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
