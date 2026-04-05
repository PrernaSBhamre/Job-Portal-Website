import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, Save, Building, MapPin, Globe, Users } from 'lucide-react';

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    location: '',
    website: '',
    size: '1-10'
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/company/my-company');
        if (res.data) {
          setHasCompany(true);
          setFormData({
            ...res.data,
            name: res.data.name || '',
            industry: res.data.industry || '',
            description: res.data.description || '',
            location: res.data.location || '',
            website: res.data.website || '',
            size: res.data.size || '1-10'
          });
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          toast.error('Error fetching company details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (hasCompany && formData._id) {
        await api.put(`/company/${formData._id}`, formData);
        toast.success('Company profile updated successfully');
      } else {
        const res = await api.post('/company', formData);
        setHasCompany(true);
        setFormData({ ...formData, _id: res.data._id });
        toast.success('Company created! Waiting for Admin verification.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving company details');
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
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
          <Building className="text-primary w-8 h-8" />
          Company Profile
        </h1>
        <p className="text-gray-400 mt-2">
          {hasCompany 
            ? formData.isVerified 
              ? <span className="text-success font-medium flex items-center gap-1">✓ Verified Profile Active</span>
              : <span className="text-amber-400 font-medium">⚠ Pending Admin Verification before Jobs can go live.</span>
            : 'Establish your company presence before posting jobs.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Company Name</label>
            <input 
              name="name" value={formData.name} onChange={handleChange}
              className="w-full bg-surface border border-gray-700 focus:border-primary text-gray-100 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-gray-600"
              placeholder="Acme Corp" required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Industry</label>
            <input 
              name="industry" value={formData.industry} onChange={handleChange}
              className="w-full bg-surface border border-gray-700 focus:border-primary text-gray-100 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-gray-600"
              placeholder="Software Technology" required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
               <Globe className="w-4 h-4 text-gray-400" /> Website
            </label>
            <input 
              name="website" type="url" value={formData.website} onChange={handleChange}
              className="w-full bg-surface border border-gray-700 focus:border-primary text-gray-100 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-gray-600"
              placeholder="https://acmecorp.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
               <MapPin className="w-4 h-4 text-gray-400" /> Location
            </label>
            <input 
              name="location" value={formData.location} onChange={handleChange}
              className="w-full bg-surface border border-gray-700 focus:border-primary text-gray-100 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-gray-600"
              placeholder="San Francisco, CA" required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" /> Company Size
            </label>
            <select
              name="size" value={formData.size} onChange={handleChange}
              className="w-full bg-surface border border-gray-700 focus:border-primary text-gray-100 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary focus:outline-none transition-all appearance-none"
            >
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange} rows="4"
              className="w-full bg-surface border border-gray-700 focus:border-primary text-gray-100 rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-gray-600 resize-none"
              placeholder="Tell applicants what your company does..." required
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" disabled={saving}
            className="group bg-gradient-to-r from-primary to-secondary hover:from-blue-500 hover:to-purple-500 text-white font-medium py-3 px-8 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            {hasCompany ? 'Save Changes' : 'Create Company'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
