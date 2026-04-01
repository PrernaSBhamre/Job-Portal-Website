import { Routes, Route, Navigate } from 'react-router-dom';
import { App as AntApp } from 'antd';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
import Applications from './pages/Applications';
import AdminMessagesPage from './pages/AdminMessagesPage';
import ResourcesManager from './pages/ResourcesManager';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Real-world: Also check if token is expired
  if (!token || user?.role !== 'admin') {
    // Redirect to main site login if not authenticated as admin
    window.location.href = 'http://localhost:5000/pages/auth/login.html';
    return null;
  }
  return children;
};

function App() {
  return (
    <AntApp>
      <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <AdminLayout>
            <Users />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute>
          <AdminLayout>
            <Jobs />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/companies" element={
        <ProtectedRoute>
          <AdminLayout>
            <Companies />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/applications" element={
        <ProtectedRoute>
          <AdminLayout>
            <Applications />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/resources" element={
        <ProtectedRoute>
          <AdminLayout>
            <ResourcesManager />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AdminLayout>
            <Profile />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AdminLayout>
            <Settings />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <AdminLayout>
            <AdminMessagesPage />
          </AdminLayout>
        </ProtectedRoute>
      } />
      </Routes>
    </AntApp>
  );
}

export default App;
