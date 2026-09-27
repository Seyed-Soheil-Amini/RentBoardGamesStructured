import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import CafeDashboard from './pages/CafeDashboard';
import AdminDashboard from './pages/AdminDashboard';

// A simple protected route wrapper
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  // Role based rendering for dashboard
  if (user.role === 'ADMIN') return <AdminDashboard />;
  if (user.role === 'CAFE_PARTNER') return <CafeDashboard />;
  return <UserDashboard />;
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-slate-900 selection:bg-indigo-500/30">
      <Navbar />
      <main className="container mx-auto px-4 pb-12">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<ProtectedRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
