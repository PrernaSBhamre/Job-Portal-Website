import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AdminApp from './App.jsx'
import './index.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// Extend dayjs with relativeTime plugin globally
dayjs.extend(relativeTime)

const handleSessionBridge = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const role = params.get('role');
  
  if (token && role === 'admin') {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ token, role, fullname: 'System Admin' }));
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.error("Session bridge capture failed:", e);
    }
  }
};

handleSessionBridge();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AdminApp />
    </BrowserRouter>
  </React.StrictMode>,
)
