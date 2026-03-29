import React, { useEffect, useState } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Trash2, 
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import API from '../utils/axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8; // Desktop optimized limit

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchTerm, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/admin/users`, {
        params: {
          page: currentPage,
          limit,
          search: searchTerm,
          role: roleFilter
        }
      });
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/block`);
      setUsers(users.map(u => u._id === id ? {...u, isBlocked: !u.isBlocked} : u));
      // alert(data.message);
    } catch (err) {
      alert('Failed to update block status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? All data will be wiped.')) {
      try {
        await API.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await API.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers(users.map(u => u._id === id ? {...u, role: newRole} : u));
    } catch (err) {
      alert('Failed to update role');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-white">Advanced User <span className="text-purple-500">Management</span></h1>
          <p className="text-gray-400 font-medium tracking-tight">Full administrative control over platform participants.</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-[22px] border border-white/5 shadow-2xl">
          {['all', 'student', 'recruiter', 'admin'].map(r => (
            <button 
              key={r}
              onClick={() => { setRoleFilter(r); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.1em] transition-all ${roleFilter === r ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-500 hover:text-white'}`}
            >
              {r === 'student' ? 'Seeker' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-[40px] overflow-hidden border-white/5 shadow-2xl shadow-black/40">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email or user ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#0b0b14]/50 border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Permissions</th>
                <th className="px-10 py-6">Safety Check</th>
                <th className="px-10 py-6">Joined Date</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                   <td colSpan="5" className="px-10 py-20 text-center">
                      <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="h-12 w-12 bg-white/5 rounded-full"></div>
                        <div className="h-4 w-32 bg-white/5 rounded-full"></div>
                      </div>
                   </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-3xl border border-white/5 flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform duration-300 shadow-xl ${user.isBlocked ? 'bg-red-500/10 text-red-500' : 'bg-gradient-to-tr from-purple-600/20 to-blue-500/10 text-purple-400'}`}>
                        {user.fullname.charAt(0)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="font-bold text-gray-100 flex items-center gap-2 group-hover:text-purple-400 transition-colors">
                          {user.fullname}
                          {user.role === 'admin' && <ShieldCheck size={16} className="text-purple-400" />}
                        </div>
                        <div className="text-[11px] text-gray-500 font-bold mb-1">{user.email}</div>
                        <div className="text-[9px] text-gray-700 font-black uppercase tracking-widest">{user._id.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 focus:outline-none focus:border-purple-500 transition-all cursor-pointer hover:bg-white/10"
                    >
                      <option value="student" className="bg-[#181824]">Seeker</option>
                      <option value="recruiter" className="bg-[#181824]">Recruiter</option>
                      <option value="admin" className="bg-[#181824]">Admin</option>
                    </select>
                  </td>
                  <td className="px-10 py-6">
                    <button 
                       onClick={() => handleToggleBlock(user._id)}
                       className={`p-3 rounded-2xl flex items-center gap-2 transition-all group/safety ${user.isBlocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 hover:border-emerald-500/30'}`}
                    >
                      {user.isBlocked ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{user.isBlocked ? 'Blocked' : 'Verified'}</span>
                    </button>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-bold text-gray-400">{new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Registered</div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-3.5 text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                        title="Delete Permanently"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button className="p-3.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="p-10 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
             <div className="text-xs font-black text-gray-600 uppercase tracking-widest">
                Showing page {currentPage} of {totalPages}
             </div>
             <div className="flex items-center gap-3">
                <button 
                   disabled={currentPage === 1}
                   onClick={() => setCurrentPage(p => p - 1)}
                   className="p-3 rounded-2xl border border-white/5 bg-white/5 text-gray-400 disabled:opacity-20 hover:text-white transition-all shadow-xl"
                >
                   <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                   {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-2xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                      >
                        {i + 1}
                      </button>
                   ))}
                </div>
                <button 
                   disabled={currentPage === totalPages}
                   onClick={() => setCurrentPage(p => p + 1)}
                   className="p-3 rounded-2xl border border-white/5 bg-white/5 text-gray-400 disabled:opacity-20 hover:text-white transition-all shadow-xl"
                >
                   <ChevronRight size={20} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
