import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building2, 
  FileText, 
  Settings, 
  LogOut,
  ShieldCheck,
  MessageSquare,
  BarChart2,
  Bell
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
    <aside className="w-80 h-screen bg-[#0b0b14] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-all duration-500 shadow-2xl overflow-y-auto">
      <div className="p-10">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-purple-900/40 group-hover:rotate-12 transition-transform duration-500">
            <ShieldCheck size={32} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tighter">ADMIN <span className="text-purple-500">PRO</span></span>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Management Suite</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-8 space-y-2 mt-4">
        <div className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] mb-4 pl-4">Main Menu</div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-600/20 to-transparent text-purple-400 border border-purple-500/20 shadow-xl shadow-purple-900/10' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
              }`
            }
          >
            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-tight">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-8 space-y-6">
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] shadow-2xl">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400"><Bell size={18} /></div>
              <span className="text-xs font-black text-white uppercase tracking-widest leading-none">Status</span>
           </div>
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">System operational. 0 pending critical alerts.</p>
        </div>

        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = 'http://localhost:5000/pages/auth/login.html';
          }}
          className="flex items-center gap-4 w-full px-6 py-4 rounded-[22px] text-red-500 hover:bg-red-500/10 transition-all group font-black uppercase tracking-widest text-[11px] border border-transparent hover:border-red-500/20"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
