import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import LibraryPage from './pages/LibraryPage';

const CursorGlow = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updatePos = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', updatePos);
    return () => window.removeEventListener('mousemove', updatePos);
  }, []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300 mix-blend-screen"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.03), transparent 40%)`
      }}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CursorGlow />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
