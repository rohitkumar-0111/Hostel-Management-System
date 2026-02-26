import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, AlertCircle, CheckCircle, Clock, Plus, Filter, Search, TrendingUp, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ category: "Maintenance", description: "" });

  const fetchComplaints = () => {
    setLoading(true);
    fetch("/api/complaints")
      .then(res => res.json())
      .then(data => {
        setComplaints(data.complaints || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Complaint submitted successfully");
        setShowModal(false);
        setFormData({ category: "Maintenance", description: "" });
        fetchComplaints();
      } else {
        toast.error("Failed to submit complaint");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-emerald-500/10 text-emerald-500";
      case "InProgress": return "bg-blue-500/10 text-blue-500";
      case "Assigned": return "bg-violet-500/10 text-violet-400";
      default: return "bg-amber-500/10 text-amber-500";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Complaints</h2>
          <p className="text-gray-500 text-sm">Track and manage your hostel issues</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all shadow-glow"
        >
          <Plus size={20} />
          <span>New Complaint</span>
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md p-8 rounded-2xl glass-panel border border-white/10 shadow-2xl relative"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">Submit New Complaint</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                  >
                    <option value="Maintenance" className="bg-surface-dark">Maintenance</option>
                    <option value="Mess/Food" className="bg-surface-dark">Mess/Food</option>
                    <option value="Security" className="bg-surface-dark">Security</option>
                    <option value="Wi-Fi/Internet" className="bg-surface-dark">Wi-Fi/Internet</option>
                    <option value="Other" className="bg-surface-dark">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-violet-500 outline-none h-32 resize-none"
                    placeholder="Describe the issue in detail..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all disabled:opacity-50 shadow-glow"
                >
                  {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Pending</p>
            <p className="text-lg font-bold text-white">{complaints.filter(c => c.status === 'Submitted').length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">In Progress</p>
            <p className="text-lg font-bold text-white">{complaints.filter(c => c.status === 'InProgress').length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Resolved</p>
            <p className="text-lg font-bold text-white">{complaints.filter(c => c.status === 'Resolved').length}</p>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-2xl glass-panel">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search complaints..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading complaints...</div>
          ) : complaints.length > 0 ? complaints.map((complaint, i) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    complaint.category === 'Maintenance' ? 'bg-amber-500/10 text-amber-500' :
                    complaint.category === 'Security' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-white">{complaint.category}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{complaint.description}</p>
                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">Submitted on {new Date(complaint.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center md:items-start gap-2">
                  <button className="px-4 py-2 rounded-lg bg-white/5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="py-12 text-center text-gray-500 italic">No complaints found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
