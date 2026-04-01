import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { fullname: 'Administrator' };

  return (
    <div className="h-16 bg-[#09090b]/80 border-b border-zinc-800 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      <div className="flex-1 flex items-center gap-4 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
          <input
            type="text"
            placeholder="Search resources, users, or audit logs..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-11 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-all">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-zinc-800 mx-2"></div>

        <div className="flex items-center gap-3 active:opacity-80 transition-opacity cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-zinc-100 leading-none mb-1">{user.fullname}</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Root Admin</span>
          </div>
          <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center font-bold text-xs text-zinc-400">
            {user.fullname?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
