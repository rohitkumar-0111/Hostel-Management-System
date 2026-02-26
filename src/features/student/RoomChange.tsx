import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bed, Plus, Clock, CheckCircle, XCircle, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export default function StudentRoomChange() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ requestedRoom: "", reason: "" });

  const fetchRequests = () => {
    setLoading(true);
    fetch("/api/room-change")
      .then(res => res.json())
      .then(data => {
        setRequests(data.requests || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/room-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Room change request submitted");
        setShowModal(false);
        setFormData({ requestedRoom: "", reason: "" });
        fetchRequests();
      } else {
        toast.error("Failed to submit request");
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
          <h2 className="text-2xl font-bold text-white">Room Change Requests</h2>
          <p className="text-gray-500 text-sm">Request to move to a different room</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all shadow-glow"
        >
          <Plus size={20} />
          <span>New Request</span>
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
              <h3 className="text-xl font-bold text-white mb-6">Request Room Change</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Current Room</label>
                  <input 
                    type="text"
                    disabled
                    value={user?.roomNumber || "N/A"}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Requested Room (Optional)</label>
                  <input 
                    type="text"
                    value={formData.requestedRoom}
                    onChange={(e) => setFormData({...formData, requestedRoom: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                    placeholder="e.g. B-302"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Reason for Change</label>
                  <textarea 
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-violet-500 outline-none h-32 resize-none"
                    placeholder="Why do you want to change your room?"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all disabled:opacity-50 shadow-glow"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-8 rounded-2xl glass-panel">
        <h3 className="text-xl font-bold text-white mb-8">Request History</h3>
        
        <div className="space-y-6">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading requests...</div>
          ) : requests.length > 0 ? requests.map((request, i) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                      <Bed size={18} />
                    </div>
                    <h4 className="font-bold text-white">
                      From {request.currentRoom} to {request.requestedRoom || "Any Available"}
                    </h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{request.reason}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                      <Clock size={12} /> Requested on {new Date(request.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="py-12 text-center text-gray-500 italic">No room change requests found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
