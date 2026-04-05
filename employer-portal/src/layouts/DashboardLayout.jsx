import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Briefcase, Users, LogOut, LayoutDashboard, Calendar, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'My Company', path: '/company', icon: Building2 },
    { name: 'Job Postings', path: '/jobs', icon: Briefcase },
    { name: 'Applications pipeline', path: '/applications', icon: Users },
    { name: 'Interviews', path: '/interviews', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-r border-gray-800 hidden md:flex md:flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Employer Portal
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-30">
           <div className="flex items-center gap-4">
              {/* Mobile Menu trigger can go here later */}
              <h2 className="text-xl font-semibold text-gray-200">Welcome back, {user?.fullname?.split(' ')[0]}</h2>
           </div>
           
           <div className="flex items-center gap-6">
              <button className="relative p-2 text-gray-400 hover:text-gray-100 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-surface animate-pulse"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-6 border-l border-gray-700">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-200">{user?.fullname}</span>
                  <span className="text-xs text-primary">{user?.role}</span>
                </div>
                <img 
                   src={user?.profilePhoto || "https://ui-avatars.com/api/?name=" + (user?.fullname || 'E')} 
                   alt="avatar" 
                   className="w-10 h-10 rounded-full border-2 border-gray-700 object-cover"
                />
              </div>
           </div>
        </header>

        {/* Dynamic Outlet Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
