import { Routes, Route } from 'react-router-dom';
import { App as AntApp, ConfigProvider, theme } from 'antd';
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
  
  if (!token || user?.role !== 'admin') {
    window.location.href = 'http://localhost:5000/pages/auth/login.html';
    return null;
  }
  return children;
};

function AdminApp() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          colorBgBase: '#000000',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
        },
        components: {
          Layout: {
            siderBg: '#09090b',
            headerBg: '#09090b',
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: 'rgba(139, 92, 246, 0.1)',
            itemSelectedColor: '#a78bfa',
          }
        }
      }}
    >
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
    </ConfigProvider>
  );
}

export default AdminApp;
