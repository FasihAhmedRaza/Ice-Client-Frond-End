import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

const Home = lazy(() => import('./pages/Home'));

const AppLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100dvh', background: '#0f172a' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Suspense fallback={<AppLoader />}>
            <div style={{ display: 'flex', width: '100vw', height: '100dvh', minHeight: 0 }}>
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <Home />
              </div>
            </div>
          </Suspense>
        } />
        {/* Redirect /app to / for backwards compatibility */}
        <Route path="/app" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
