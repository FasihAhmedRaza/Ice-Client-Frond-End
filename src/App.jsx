import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div style={{ display: 'flex', width: '100vw', height: '100dvh', minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <Home />
            </div>
          </div>
        } />
        {/* Redirect /app to / for backwards compatibility */}
        <Route path="/app" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
