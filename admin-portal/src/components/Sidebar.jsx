import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building2, 
  FileText, 
  LogOut,
  ShieldCheck,
  MessageSquare,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Building2, label: 'Companies', path: '/companies' },
    { icon: FileText, label: 'Applications', path: '/applications' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
  ];

  return (
    <aside className="w-64 h-screen bg-[#09090b] border-r border-zinc-800 flex flex-col fixed left-0 top-0 z-50 overflow-y-auto">
      {/* Platform Branding */}
      <div className="p-6 border-b border-zinc-900">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
            TJ
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight uppercase leading-none mb-1">Tools and Job</span>
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Enterprise Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-1">Overview</span>
        </div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group ${
                isActive 
                  ? 'bg-zinc-900 text-white font-medium' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* System Health & Footer */}
      <div className="p-4 border-t border-zinc-900 space-y-4">
        <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
           <div className="flex items-center gap-2 mb-1.5">
              <Activity size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">System Status</span>
           </div>
           <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">All services operational. No active incident reports.</p>
        </div>

        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = 'http://localhost:5000/pages/auth/login.html';
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all font-medium text-sm group"
        >
          <LogOut size={18} className="group-hover:text-red-500 transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
