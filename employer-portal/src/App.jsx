import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EmployerLayout from './layouts/EmployerLayout';
import RecruiterRoute from './components/RecruiterRoute';
import Dashboard from './pages/employer/Dashboard';
import MyJobs from './pages/employer/MyJobs';
import JobApplicants from './pages/employer/JobApplicants';
import CompanyProfile from './pages/employer/CompanyProfile';
import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
          },
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/employer/dashboard" replace />} />
          <Route path="/employer" element={<RecruiterRoute />}>
            <Route element={<EmployerLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="jobs" element={<MyJobs />} />
              <Route path="jobs/:id/applicants" element={<JobApplicants />} />
              <Route path="company" element={<CompanyProfile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/employer/dashboard" replace />} />
        </Routes>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
