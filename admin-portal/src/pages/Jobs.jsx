import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Trash2, 
  MapPin, 
  IndianRupee, 
  Bookmark, 
  Clock, 
  Building2,
  ChevronRight,
  ChevronLeft,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import API from '../utils/axios';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, currentPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/jobs', {
        params: {
          page: currentPage,
          limit,
          search: searchTerm
        }
      });
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job listing?')) {
      try {
        await API.delete(`/admin/jobs/${id}`);
        fetchJobs();
      } catch (err) {
        alert('Failed to delete job');
      }
    }
  };

  const handleToggleApproval = async (id) => {
    try {
      await API.put(`/admin/jobs/${id}/approve`);
      setJobs(jobs.map(j => j._id === id ? {...j, isApproved: !j.isApproved} : j));
    } catch (err) {
      alert('Failed to update approval status');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await API.put(`/admin/jobs/${id}/feature`);
      setJobs(jobs.map(j => j._id === id ? {...j, isFeatured: !j.isFeatured} : j));
    } catch (err) {
      alert('Failed to update featured status');
    }
  };

  if (loading && currentPage === 1) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-white">Job <span className="text-purple-500">Inventory</span> Management</h1>
          <p className="text-gray-400 font-medium tracking-tight">Approve, feature, or remove platform career listings.</p>
        </div>

        <div className="relative group max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by job title or keyword..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#181824]/50 border border-white/5 rounded-[22px] py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-700 shadow-2xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {jobs.map((job) => (
          <div key={job._id} className="glass rounded-[40px] p-10 border-white/5 hover:border-purple-500/20 transition-all group relative overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Action Bar */}
            <div className="absolute top-8 right-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              <button 
                onClick={() => handleToggleFeatured(job._id)}
                className={`p-3 rounded-2xl border transition-all ${job.isFeatured ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'}`}
                title="Toggle Featured"
              >
                <Star size={20} fill={job.isFeatured ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={() => handleToggleApproval(job._id)}
                className={`p-3 rounded-2xl border transition-all ${job.isApproved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}
                title="Toggle Approval"
              >
                {job.isApproved ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              </button>
              <button 
                onClick={() => handleDelete(job._id)}
                className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all shadow-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="flex gap-8 mb-8">
              <div className="w-24 h-24 bg-[#0b0b14] rounded-[32px] border border-white/5 flex items-center justify-center text-4xl font-black text-purple-500 shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-2xl overflow-hidden">
                {job.company?.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-400/10 px-3 py-1.5 rounded-xl border border-purple-400/20 shadow-lg">
                    {job.jobType || 'Full-Time'}
                  </span>
                  {job.isFeatured && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 shadow-lg flex items-center gap-1.5">
                      <Star size={10} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>
                
                <h2 className="text-2xl font-black text-white truncate mb-4 group-hover:text-purple-400 transition-colors leading-tight">
                  {job.title}
                </h2>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div className="flex items-center gap-3 text-sm text-gray-400 font-bold group-hover:text-gray-200 transition-colors">
                    <Building2 size={18} className="text-gray-600" />
                    <span className="truncate">{job.company?.name || 'Private Co.'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 font-bold group-hover:text-gray-200 transition-colors">
                    <MapPin size={18} className="text-gray-600" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 font-bold group-hover:text-gray-200 transition-colors">
                    <IndianRupee size={18} className="text-emerald-500" />
                    <span className="font-black text-emerald-400 text-base">{job.salary || 'Not Disclosed'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 font-bold group-hover:text-gray-200 transition-colors">
                    <Bookmark size={18} className="text-gray-600" />
                    <span className="truncate">{job.experienceLevel || 'Fresher'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-2xl border-4 border-[#181824] bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-400 overflow-hidden shadow-xl">
                        <img src={`https://i.pravatar.cc/150?u=${i+job._id}`} alt="applicant" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-2xl border-4 border-[#181824] bg-purple-600 text-white flex items-center justify-center text-[11px] font-black shadow-xl">
                      +15
                    </div>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Total Impact</span>
                     <span className="text-sm font-black text-gray-200">2.4k Views</span>
                  </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                   <div className="text-[11px] text-gray-600 font-black uppercase tracking-tighter">Listed On</div>
                   <div className="text-xs font-black text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-gray-600 group-hover:text-purple-500 group-hover:bg-purple-600/10 group-hover:border-purple-600/20 transition-all cursor-pointer">
                   <ChevronRight size={24} />
                </div>
              </div>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="col-span-full py-40 flex flex-col items-center gap-8 justify-center">
            <div className="w-32 h-32 bg-white/5 rounded-[48px] flex items-center justify-center text-gray-700 border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
              <Briefcase size={60} />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-gray-100 mb-2">No listings currently tracked</h3>
              <p className="text-gray-500 font-medium text-lg">Try adjusting your central search filters.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Container */}
      <div className="flex items-center justify-center gap-6 pt-12 pb-24">
         <button 
           disabled={currentPage === 1}
           onClick={() => setCurrentPage(p => p - 1)}
           className="p-5 rounded-3xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-10 hover:text-white hover:bg-white/10 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
         >
           <ChevronLeft size={24} />
         </button>
         
         <div className="flex items-center gap-4">
           {[...Array(totalPages)].map((_, i) => (
             <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)}
                className={`w-14 h-14 rounded-3xl text-sm font-black transition-all border ${currentPage === i + 1 ? 'bg-purple-600 text-white border-purple-500 shadow-[0_15px_30px_rgba(109,40,217,0.4)]' : 'bg-white/5 text-gray-500 border-white/5 hover:text-white hover:border-white/10'}`}
             >
                {i + 1}
             </button>
           ))}
         </div>

         <button 
           disabled={currentPage === totalPages}
           onClick={() => setCurrentPage(p => p + 1)}
           className="p-5 rounded-3xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-10 hover:text-white hover:bg-white/10 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
         >
           <ChevronRight size={24} />
         </button>
      </div>
    </div>
  );
};

export default Jobs;
