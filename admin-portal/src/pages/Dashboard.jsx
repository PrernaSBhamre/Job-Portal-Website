import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Building2, 
  FileText, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  UserPlus,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart3
} from 'lucide-react';
import API from '../utils/axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color, trend, daily }) => (
    <div className="glass rounded-[40px] p-8 border-white/5 hover:border-white/10 transition-all group relative overflow-hidden shadow-2xl">
      <div className={`absolute top-0 right-0 p-8 text-${color}-500/10 group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={120} strokeWidth={1} />
      </div>
      
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-3xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 mb-6 border border-${color}-500/20 shadow-lg shadow-${color}-900/10`}>
          <Icon size={28} />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
          {trend && <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{trend}</span>}
        </div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{title}</p>
        
        {daily && (
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-xs font-black text-emerald-500">{daily}</span>
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">today</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 leading-none">Global <span className="text-purple-500 font-black">Analytics</span></h1>
          <p className="text-gray-400 font-medium text-lg">Central hub for platform monitoring and administrative insights.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-3xl border border-white/5 shadow-2xl">
          <div className="px-6 py-3 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-900/40">Real-time</div>
          <div className="pr-6 text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
            <Clock size={12} /> Last sync: just now
          </div>
        </div>
      </div>

      {/* Grid for main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Users" value={stats.totals.users} icon={Users} color="purple" trend="+12%" daily={stats.totals.usersToday || '5'} />
        <StatCard title="Active Jobs" value={stats.totals.activeJobs} icon={Briefcase} color="blue" trend="+5%" daily={stats.totals.jobsToday} />
        <StatCard title="Total Apps" value={stats.totals.applications} icon={FileText} color="emerald" daily={stats.totals.appsToday} />
        <StatCard title="Companies" value={stats.totals.companies} icon={Building2} color="orange" trend="+2%" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Users List */}
        <div className="xl:col-span-2 glass rounded-[40px] border-white/5 shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white leading-none mb-1">Recent Signups</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Platform entry logs</p>
              </div>
            </div>
            <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all shadow-xl group">
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recent.users.map((user) => (
              <div key={user._id} className="p-10 hover:bg-white/[0.01] transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/5 rounded-[22px] flex items-center justify-center text-xl font-black text-gray-400 group-hover:bg-purple-600/10 group-hover:text-purple-400 transition-all border border-transparent group-hover:border-purple-500/20">
                    {user.fullname.charAt(0)}
                  </div>
                  <div>
                    <div className="font-black text-gray-100 mb-0.5">{user.fullname}</div>
                    <div className="text-xs text-gray-500 font-bold tracking-tight">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${user.role === 'recruiter' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {user.role}
                  </span>
                  <div className="text-[10px] text-gray-700 font-bold mt-2">{new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown Panel */}
        <div className="flex flex-col gap-8">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 glass rounded-[40px] p-10 border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 text-white/5 group-hover:rotate-12 transition-transform duration-1000">
                    <Zap size={240} strokeWidth={1} />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                    <BarChart3 size={20} className="text-purple-500" /> Platform Health
                </h3>
                <div className="space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400"><Layers size={20} /></div>
                            <span className="text-sm font-bold text-gray-300">Closed Listings</span>
                        </div>
                        <span className="text-lg font-black text-white">{stats.totals.closedJobs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircle2 size={20} /></div>
                            <span className="text-sm font-bold text-gray-300">Open Vacancies</span>
                        </div>
                        <span className="text-lg font-black text-white">{stats.totals.activeJobs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400"><Calendar size={20} /></div>
                            <span className="text-sm font-bold text-gray-300">Jobs Posted Today</span>
                        </div>
                        <span className="text-lg font-black text-white">{stats.totals.jobsToday}</span>
                    </div>
                </div>
            </div>

            <div className="bg-[#1a1a2e] glass rounded-[40px] p-10 border-white/5 shadow-2xl">
                <h3 className="text-lg font-black text-white mb-6 leading-tight">Platform Growth</h3>
                <div className="h-2 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                    <div className="h-full bg-purple-500 w-[78%] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Target: 100k Users</span>
                    <span className="text-xs font-black text-purple-400">78%</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
