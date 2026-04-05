import React from 'react';

const Overview = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Welcome to the Dashboard</h1>
        <p className="text-gray-400">Manage your jobs, view applicants, and schedule interviews.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder stats */}
        <div className="glass-panel p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Active Jobs</h3>
          <p className="text-4xl font-bold text-gray-100">0</p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Applicants</h3>
          <p className="text-4xl font-bold text-gray-100">0</p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Interviews Scheduled</h3>
          <p className="text-4xl font-bold text-gray-100">0</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
