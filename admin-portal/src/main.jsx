import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const handleSessionBridge = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const role = params.get('role');
  
  if (token && role === 'admin') {
    try {
      localStorage.setItem('token', token);
      // Create a minimal user object in localStorage for app consistency
      localStorage.setItem('user', JSON.stringify({ token, role, fullname: 'System Admin' }));
      
      // Clear params for a clean professional URL
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
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
