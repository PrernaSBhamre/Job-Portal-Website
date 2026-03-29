import React, { useEffect, useState } from 'react';
import { Mail, Search, MessageSquare, CheckCircle, Trash2, Clock, Filter } from 'lucide-react';
import API from '../utils/axios';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await API.get('/admin/messages');
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await API.put(`/admin/messages/${id}/resolve`);
      setMessages(messages.map(m => m._id === id ? {...m, status: 'resolved'} : m));
    } catch (err) {
      alert('Failed to resolve message');
    }
  };

  const filteredMessages = messages.filter(m => filter === 'all' || m.status === filter);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Support <span className="text-purple-500">Messages</span></h1>
          <p className="text-gray-400 font-medium">Manage platform inquiries and user support tickets.</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          {['all', 'unresolved', 'resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMessages.map(msg => (
          <div key={msg._id} className="glass rounded-3xl p-6 border-white/5 hover:border-purple-500/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-purple-400 border border-white/5 relative">
                    <Mail size={20} />
                    {msg.status === 'unresolved' && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#181824]"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-100">{msg.name}</h3>
                    <p className="text-xs text-gray-500 font-bold">{msg.email}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl border ${msg.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                  {msg.status}
                </span>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-6">
                <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <MessageSquare size={12} /> {msg.subject}
                </h4>
                <p className="text-sm text-gray-400 leading-relaxed italic line-clamp-3">"{msg.message}"</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                <Clock size={12} /> {new Date(msg.createdAt).toLocaleDateString()}
              </div>
              
              {msg.status === 'unresolved' && (
                <button 
                  onClick={() => handleResolve(msg._id)}
                  className="px-4 py-2 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-900/10"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-gray-600 border border-white/5">
              <MessageSquare size={32} />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No messages found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessagesPage;
