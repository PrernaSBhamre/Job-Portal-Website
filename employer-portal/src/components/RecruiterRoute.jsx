import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';

const RecruiterRoute = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const location = useLocation();

  if (!token || !user) {
    window.location.href = 'http://localhost:5000/pages/auth/login.html';
    return null;
  }

  if (user.role !== 'recruiter' && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, only recruiters or admins can access this portal."
          extra={<Button type="primary" onClick={() => window.location.href = 'http://localhost:5000/index.html'}>Back Home</Button>}
        />
      </div>
    );
  }

  return <Outlet />;
};

export default RecruiterRoute;
