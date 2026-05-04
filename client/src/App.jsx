import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProfileUpload from './pages/ProfileUpload';
import SkillReview from './pages/SkillReview';
import LearningPath from './pages/LearningPath';
import Mentor from './pages/Mentor';
import Analytics from './pages/Analytics';
import Planner from './pages/Planner';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const { isDarkMode } = useTheme();
  const themeClass = isDarkMode ? 'dark' : 'light';
  const { user } = useAuth();
  const location = useLocation();

  const hideNavigationPaths = ['/', '/login', '/signup'];
  const shouldShowNavigation = user && !hideNavigationPaths.includes(location.pathname);

  return (
    <div className={`app-container ${themeClass} flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
      {shouldShowNavigation && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {shouldShowNavigation && <Navbar />}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><ProfileUpload /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><SkillReview /></ProtectedRoute>} />
            <Route path="/path" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
            <Route path="/mentor" element={<ProtectedRoute><Mentor /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
