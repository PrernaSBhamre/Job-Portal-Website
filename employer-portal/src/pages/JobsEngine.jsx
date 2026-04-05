import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Plus, Briefcase, MapPin, Clock, MoreVertical, X, Loader2 } from 'lucide-react';

const JobsEngine = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', type: 'full-time', 
    experienceLevel: 'Entry Level', minSalary: '', maxSalary: '', currency: 'USD'
  });

  const fetchJobs = async () => {
    try {
      // Backend /api/jobs usually returns employer's jobs via protect + isEmployer middleware
      const res = await api.get('/jobs');
      setJobs(res.data.jobs || res.data); // Adjusting based on standard response wraps
    } catch (err) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
         ...formData,
         salary: {
            min: Number(formData.minSalary),
            max: Number(formData.maxSalary),
            currency: formData.currency
         }
      };
      await api.post('/jobs', payload);
      toast.success('Job created! Awaiting admin approval.', { icon: '⏳' });
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating job');
    } finally {
      setSaving(false);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
             <Briefcase className="text-primary w-8 h-8" />
             Jobs Board
          </h1>
          <p className="text-gray-400 mt-2">Manage your listings and track approval statuses.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-500 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="glass-panel text-center py-20">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-200">No jobs posted yet</h3>
          <p className="text-gray-400 mt-2">Get started by creating your first listing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map(job => (
            <div key={job._id} className="glass-panel p-6 flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-xl font-bold text-gray-100 group-hover:text-primary transition-colors">{job.title}</h3>
                   <button className="text-gray-500 hover:text-gray-300">
                     <MoreVertical className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    job.isApproved ? 'bg-success/20 text-emerald-400 border border-success/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {job.isApproved ? 'Live' : 'Pending Approval'}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-800 text-gray-300 border border-gray-700 capitalize">
                    {job.type?.replace('-', ' ')}
                  </span>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{job.description}</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" /> {job.location}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" /> {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-2xl p-6 relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Create New Job</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Job Title</label>
                  <input name="title" required value={formData.title} onChange={handleChange} className="w-full bg-surface border border-gray-700 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Location</label>
                  <input name="location" required value={formData.location} onChange={handleChange} className="w-full bg-surface border border-gray-700 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Job Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-surface border border-gray-700 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-primary">
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-1">
                 <label className="text-sm text-gray-300">Experience</label>
                  <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="w-full bg-surface border border-gray-700 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-primary">
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Min Salary</label>
                  <input name="minSalary" type="number" required value={formData.minSalary} onChange={handleChange} className="w-full bg-surface border border-gray-700 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Max Salary</label>
                  <input name="maxSalary" type="number" required value={formData.maxSalary} onChange={handleChange} className="w-full bg-surface border border-gray-700 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-300">Description</label>
                <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="w-full bg-surface border border-gray-700 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-primary resize-none" />
              </div>
              <div className="flex justify-end pt-4 gap-3 border-t border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="bg-primary hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 flex items-center gap-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Plus className="w-5 h-5"/>} Submit Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsEngine;
