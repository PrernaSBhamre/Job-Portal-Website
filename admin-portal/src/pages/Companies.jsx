import React, { useEffect, useState } from 'react';
import { Building2, Search, Trash2, Globe, MapPin, Calendar, Trash, MoreVertical } from 'lucide-react';
import API from '../utils/axios';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await API.get('/admin/companies');
        setCompanies(data);
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this company and all its job postings?')) {
      try {
        await API.delete(`/admin/companies/${id}`);
        setCompanies(companies.filter(c => c._id !== id));
      } catch (err) {
        alert('Deletion failed');
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Registered <span className="text-purple-500">Companies</span></h1>
          <p className="text-gray-400 font-medium tracking-tight">Enterprise partners and recruiter organizational profiles.</p>
        </div>
        <div className="relative group max-w-xs w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
           <input type="text" placeholder="Search enterprise..." className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company._id} className="glass rounded-[32px] p-6 border-white/5 hover:border-purple-500/20 transition-all group relative overflow-hidden flex flex-col justify-between shadow-2xl">
             <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-white/5 rounded-[22px] border border-white/5 flex items-center justify-center text-2xl font-black text-purple-400 shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                     {company.logo ? <img src={company.logo} alt="logo" className="w-full h-full object-cover" /> : company.name.charAt(0)}
                  </div>
                  <button 
                    onClick={() => handleDelete(company._id)}
                    className="p-3 bg-red-500/10 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-500 transition-all hover:text-white shadow-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-lg font-black text-white mb-2 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{company.name}</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest leading-none">
                    <Globe size={14} className="text-gray-700" /> {company.website || 'No website'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest leading-none">
                    <MapPin size={14} className="text-gray-700" /> {company.location || 'Remote'}
                  </div>
                </div>

                <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed italic mb-8 border-l-2 border-purple-500/20 pl-4">
                  {company.description || 'Enterprise profile pending detailed description update...'}
                </p>
             </div>

             <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                   <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.15em]">Admin:</div>
                   <div className="text-[11px] text-gray-200 font-black">{company.userId?.fullname || 'System'}</div>
                </div>
                <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.15em] flex items-center gap-2">
                  <Calendar size={12} /> {new Date(company.createdAt).getFullYear()}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Companies;
