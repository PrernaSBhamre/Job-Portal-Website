import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Professional Session Bridge for Cross-Port Authentication
const handleSessionBridge = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const role = urlParams.get('role');

  if (token && role) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ role }));
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

handleSessionBridge();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
