import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketProvider';
import { Toaster } from 'react-hot-toast';

// Layouts & Pages
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import CompanyProfile from './pages/CompanyProfile';
import JobsEngine from './pages/JobsEngine';
import ApplicationsKanban from './pages/ApplicationsKanban';
import Interviews from './pages/Interviews';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedShell = () => (
  <SocketProvider>
    <DashboardLayout />
  </SocketProvider>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#fff',
              border: '1px solid #1F2937',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><ProtectedShell /></ProtectedRoute>}>
             <Route index element={<Overview />} />
             <Route path="company" element={<CompanyProfile />} />
             <Route path="jobs" element={<JobsEngine />} />
             <Route path="applications" element={<ApplicationsKanban />} />
             <Route path="interviews" element={<Interviews />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
