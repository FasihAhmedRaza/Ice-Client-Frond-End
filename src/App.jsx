import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import brandLogo from './assets/react.svg';

const Home = lazy(() => import('./pages/Home'));

const AppLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100dvh', background: '#0f172a' }}>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    `}</style>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'fadeUp 0.4s ease' }}>
      <img src={brandLogo} alt="Ice Butcher Works" style={{ width: '110px', height: '110px', objectFit: 'contain' }} />
      <div style={{ width: '36px', height: '36px', border: '3px solid #1e293b', borderTop: '3px solid #52caef', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#475569', fontSize: '0.78rem', letterSpacing: '0.05em' }}>Loading your workspace…</span>
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
