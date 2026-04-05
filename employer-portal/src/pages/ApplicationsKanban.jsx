import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, Users, Search, Filter, MoreHorizontal, MoveRight, XSquare, CheckSquare, Calendar as CalendarIcon } from 'lucide-react';

const COLUMNS = [
  { id: 'applied', label: 'Applied', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'viewed', label: 'Reviewed', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { id: 'interview_scheduled', label: 'Interviewing', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'hired', label: 'Hired', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
];

const ApplicationsKanban = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data.applications || res.data);
    } catch (err) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const moveApplication = async (app_id, newStatus) => {
    setUpdatingId(app_id);
    try {
      await api.patch(`/applications/${app_id}/status`, { status: newStatus });
      toast.success(`Application moved to ${newStatus.replace('_', ' ')}`);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid state transition');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Group applications by status
  const board = COLUMNS.map(col => ({
    ...col,
    cards: applications.filter(app => app.status === col.id)
  }));

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
             <Users className="text-secondary w-8 h-8" />
             Applications Pipeline
          </h1>
          <p className="text-gray-400 mt-2">Manage candidate progression through the strict hiring workflow.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              placeholder="Search candidate..." 
              className="bg-surface border border-gray-700 text-sm text-white rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:border-secondary w-full md:w-64"
            />
          </div>
          <button className="bg-surface border border-gray-700 hover:border-gray-500 px-3 py-2 rounded-lg text-gray-300 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {board.map((column) => (
            <div key={column.id} className="w-80 flex flex-col glass-panel bg-surface/40 p-4 border-gray-800/60 max-h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${column.color}`}>
                    {column.label}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{column.cards.length}</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {column.cards.map(app => (
                  <div key={app._id} className="bg-surface border border-gray-700 hover:border-secondary/50 rounded-lg p-4 cursor-pointer transition-colors shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                       <h4 className="font-semibold text-gray-200">{app.applicant?.fullname || 'Candidate'}</h4>
                       {updatingId === app._id && <Loader2 className="w-4 h-4 animate-spin text-secondary" />}
                    </div>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-1 border-l-2 border-secondary/30 pl-2">
                       {app.job?.title || 'Unknown Job'}
                    </p>
                    
                    {/* Action Panel enforcing 1-way flow */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-800">
                       {app.status === 'applied' && (
                         <button onClick={() => moveApplication(app._id, 'viewed')} className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 bg-purple-900/20 px-2 py-1 rounded">
                           <MoveRight className="w-3 h-3" /> Mark Viewed
                         </button>
                       )}
                       {app.status === 'viewed' && (
                         <>
                           <button onClick={() => moveApplication(app._id, 'shortlisted')} className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 bg-indigo-900/20 px-2 py-1 rounded">
                             <CheckSquare className="w-3 h-3" /> Shortlist
                           </button>
                           <button onClick={() => moveApplication(app._id, 'rejected')} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 bg-red-900/20 px-2 py-1 rounded">
                             <XSquare className="w-3 h-3" /> Reject
                           </button>
                         </>
                       )}
                       {app.status === 'shortlisted' && (
                         <button onClick={() => moveApplication(app._id, 'interview_scheduled')} className="text-xs flex items-center gap-1 text-amber-400 hover:text-amber-300 bg-amber-900/20 px-2 py-1 rounded w-full justify-center">
                           <CalendarIcon className="w-3 h-3" /> Schedule Interview
                         </button>
                       )}
                       {app.status === 'interview_scheduled' && (
                         <>
                           <button onClick={() => moveApplication(app._id, 'hired')} className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-900/20 px-2 py-1 rounded flex-1 justify-center">
                             <CheckSquare className="w-3 h-3" /> Hire
                           </button>
                           <button onClick={() => moveApplication(app._id, 'rejected')} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 bg-red-900/20 px-2 py-1 rounded flex-1 justify-center">
                             <XSquare className="w-3 h-3" /> Reject
                           </button>
                         </>
                       )}
                    </div>
                  </div>
                ))}
                
                {column.cards.length === 0 && (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-lg">
                    <span className="text-sm text-gray-500">Empty</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsKanban;
