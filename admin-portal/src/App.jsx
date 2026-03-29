import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
import Applications from './pages/Applications';
import AdminMessagesPage from './pages/AdminMessagesPage';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  if (!token || user?.role !== 'admin') {
    window.location.href = 'http://localhost:5000/pages/auth/login.html';
    return null;
  }
  return children;
};

function App() {
  useEffect(() => {
    // Multi-Port Session Bridge Listener
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session');
    
    if (session) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(session)));
        localStorage.setItem('token', decoded.token);
        localStorage.setItem('user', JSON.stringify(decoded));
        
        // Clean URL to prevent re-absorption and improve security
        window.history.replaceState({}, document.title, "/");
        console.log("Admin session bridged successfully.");
      } catch (err) {
        console.error("Failed to decode session bridge:", err);
      }
    }
  }, []);

  return (
    <div className="flex bg-[#0b0b14] min-h-screen text-white selection:bg-purple-600/30 selection:text-purple-300">
      <Sidebar />
      <div className="flex-1 ml-80 min-h-screen relative">
        <Navbar />
        <main className="px-12 py-12 max-w-[1600px] mx-auto">
          <Routes>
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
            <Route path="/companies" element={<PrivateRoute><Companies /></PrivateRoute>} />
            <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><AdminMessagesPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        {/* Abstract Background Elements */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      </div>
    </div>
  );
}

export default App;
