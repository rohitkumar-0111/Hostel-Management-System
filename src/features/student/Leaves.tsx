import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, Clock, CheckCircle, XCircle, Plus, MapPin, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function StudentLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ fromDate: "", toDate: "", reason: "" });

  const fetchLeaves = () => {
    setLoading(true);
    fetch("/api/leaves")
      .then(res => res.json())
      .then(data => {
        setLeaves(data.leaves || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Leave request submitted");
        setShowModal(false);
        setFormData({ fromDate: "", toDate: "", reason: "" });
        fetchLeaves();
      } else {
        toast.error("Failed to submit leave request");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-500/10 text-emerald-500";
      case "Rejected": return "bg-red-500/10 text-red-500";
      default: return "bg-amber-500/10 text-amber-500";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Leave Requests</h2>
          <p className="text-gray-500 text-sm">Manage your out-of-campus permissions</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all shadow-glow"
        >
          <Plus size={20} />
          <span>Apply for Leave</span>
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
              <h3 className="text-xl font-bold text-white mb-6">Apply for Leave</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">From Date</label>
                    <input 
                      type="date"
                      required
                      value={formData.fromDate}
                      onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">To Date</label>
                    <input 
                      type="date"
                      required
                      value={formData.toDate}
                      onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Reason</label>
                  <textarea 
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-violet-500 outline-none h-32 resize-none"
                    placeholder="Reason for leave..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all disabled:opacity-50 shadow-glow"
                >
                  {submitting ? "Submitting..." : "Submit Leave Request"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl glass-panel text-center">
          <p className="text-xs text-gray-500 font-bold uppercase mb-2">Total Applied</p>
          <p className="text-3xl font-bold text-white">{leaves.length}</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel text-center border-amber-500/20">
          <p className="text-xs text-amber-500 font-bold uppercase mb-2">Pending</p>
          <p className="text-3xl font-bold text-white">{leaves.filter(l => l.status === 'Pending').length}</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel text-center border-emerald-500/20">
          <p className="text-xs text-emerald-500 font-bold uppercase mb-2">Approved</p>
          <p className="text-3xl font-bold text-white">{leaves.filter(l => l.status === 'Approved').length}</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel text-center">
          <p className="text-xs text-gray-500 font-bold uppercase mb-2">Days Used</p>
          <p className="text-3xl font-bold text-white">12</p>
        </div>
      </div>

      <div className="p-8 rounded-2xl glass-panel">
        <h3 className="text-xl font-bold text-white mb-8">Recent Requests</h3>
        
        <div className="space-y-6">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading requests...</div>
          ) : leaves.length > 0 ? leaves.map((leave, i) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                      <Calendar size={18} />
                    </div>
                    <h4 className="font-bold text-white">
                      {new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}
                    </h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{leave.reason}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                      <Clock size={12} /> Applied on {new Date(leave.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {leave.status === 'Pending' && (
                    <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all">
                      Cancel Request
                    </button>
                  )}
                  <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-xs font-bold hover:text-white transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="py-12 text-center text-gray-500 italic">No leave requests found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
