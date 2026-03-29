import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  User, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Filter,
  Trash2,
  Mail,
  Download
} from 'lucide-react';
import API from '../utils/axios';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await API.get('/admin/applications');
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant?.fullname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 leading-none">Application <span className="text-purple-500">Monitoring</span></h1>
          <p className="text-gray-400 font-medium text-lg tracking-tight">Real-time tracking of career opportunities and candidate flow.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[32px] border border-white/5 shadow-2xl">
          {['all', 'pending', 'shortlisted', 'rejected'].map(s => (
            <button 
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-6 py-2.5 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${statusFilter === s ? 'bg-purple-600 text-white shadow-xl shadow-purple-900/20 px-8' : 'text-gray-500 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-[40px] overflow-hidden border-white/5 shadow-2xl">
        <div className="p-10 border-b border-white/5 bg-white/[0.02] flex items-center gap-8">
           <div className="relative group flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
              <input 
                 type="text" 
                 placeholder="Search by candidate name or job title..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-[#0b0b14] border border-white/5 rounded-[28px] py-5 pl-16 pr-8 text-sm font-bold focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-700" 
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] text-gray-600 text-[10px] font-black uppercase tracking-[0.25em] border-b border-white/5">
                <th className="px-12 py-8">Candidate Profile</th>
                <th className="px-12 py-8">Target Opportunity</th>
                <th className="px-12 py-8">Engagement Status</th>
                <th className="px-12 py-8">Filing Date</th>
                <th className="px-12 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredApps.map((app) => (
                <tr key={app._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-tr from-purple-600/10 to-blue-500/10 rounded-[28px] border border-white/5 flex items-center justify-center text-xl font-black text-purple-400 shadow-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                        {app.applicant?.fullname.charAt(0)}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="font-black text-white group-hover:text-purple-400 transition-colors text-lg tracking-tight leading-none">{app.applicant?.fullname}</div>
                        <div className="text-[11px] text-gray-500 font-bold flex items-center gap-1.5"><Mail size={12} className="text-gray-700" /> {app.applicant?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex flex-col gap-1.5">
                      <div className="font-black text-gray-200 uppercase tracking-tight text-sm leading-none">{app.job?.title}</div>
                      <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest">{app.job?._id.slice(-12)}</span>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                      app.status === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                      {app.status === 'shortlisted' ? <CheckCircle size={14} /> : app.status === 'rejected' ? <XCircle size={14} /> : <Clock size={14} />}
                      {app.status}
                    </span>
                  </td>
                  <td className="px-12 py-8">
                    <div className="text-sm font-black text-gray-500">{new Date(app.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       <button className="p-3 bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/20 rounded-2xl transition-all shadow-xl" title="Download CV">
                          <Download size={20} />
                       </button>
                       <button className="p-3 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-white/10 rounded-2xl transition-all shadow-xl">
                          <MoreVertical size={20} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredApps.length === 0 && (
            <div className="py-40 flex flex-col items-center gap-8 justify-center">
              <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center text-gray-800 border border-white/5 shadow-inner">
                <FileText size={48} />
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No applications matching your filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
