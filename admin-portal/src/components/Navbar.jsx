import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { fullname: 'Admin' };

  return (
    <div className="h-16 glass border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl bg-black/40">
      <div className="flex-1 flex items-center gap-4 max-w-lg">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search everything..."
            className="w-full bg-[#181824]/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border border-[#0b0b14]"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-white leading-tight">{user.fullname}</span>
            <span className="text-xs text-purple-400 font-medium tracking-wide uppercase">Administrator</span>
          </div>
          <div className="w-9 h-9 bg-gradient-to-tr from-purple-600 to-[#0b0b14] rounded-lg border border-purple-500/20 flex items-center justify-center font-bold text-sm">
            {user.fullname?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
