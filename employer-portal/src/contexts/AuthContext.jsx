import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('employer_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const response = await api.get('/auth/me');
      // Accept both 'recruiter' and 'employer' roles
      if (response.data && (response.data.role === 'recruiter' || response.data.role === 'employer')) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    // Save token to localStorage so the axios interceptor can use it
    if (res.data && res.data.token) {
      localStorage.setItem('employer_token', res.data.token);
      // Also store basic user info for quick access
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    await fetchUser();
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore logout errors
    }
    localStorage.removeItem('employer_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
