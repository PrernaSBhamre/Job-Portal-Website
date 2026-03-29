import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to add the JWT token to headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - maybe token expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'http://localhost:5000/pages/auth/login.html';
    }
    return Promise.reject(error);
  }
);

export default API;
