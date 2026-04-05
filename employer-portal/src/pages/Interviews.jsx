import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, Video, Loader2, Link2, Trash2 } from 'lucide-react';

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews');
      setInterviews(res.data.interviews || res.data);
    } catch (err) {
      toast.error('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const cancelInterview = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;
    try {
      await api.patch(`/interviews/${id}/status`, { status: 'cancelled' });
      toast.success('Interview cancelled successfully');
      fetchInterviews();
    } catch (err) {
      toast.error('Failed to cancel interview');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
           <Calendar className="text-secondary w-8 h-8" />
           Interview Schedule
        </h1>
        <p className="text-gray-400 mt-2">Manage upcoming technical screens and culture fits.</p>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-panel text-center py-20">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-200">No interviews currently scheduled</h3>
          <p className="text-gray-400 mt-2">Move candidates to "Interviewing" on the Kanban board to trigger a schedule.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {interviews.map(interview => (
            <div key={interview._id} className="glass-panel p-6 flex flex-col md:flex-row gap-6 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-shadow">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-100">{interview.applicationId?.applicant?.fullname || 'Candidate'}</h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize border ${
                    interview.status === 'scheduled' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                    interview.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {interview.status}
                  </span>
                </div>
                <p className="text-gray-400 mb-4">{interview.jobId?.title || 'Job Name'}</p>
                
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" /> {interview.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary" /> {interview.startTime} - {interview.endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-secondary" /> Platform: {interview.platform}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                {interview.meetingLink && (
                   <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="bg-surface border border-gray-700 hover:border-secondary py-2 text-sm text-center rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <Link2 className="w-4 h-4" /> Join
                   </a>
                )}
                {interview.status === 'scheduled' && (
                  <button onClick={() => cancelInterview(interview._id)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 py-2 text-sm text-center rounded-xl flex items-center justify-center gap-2 transition-colors">
                     <Trash2 className="w-4 h-4" /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Interviews;
