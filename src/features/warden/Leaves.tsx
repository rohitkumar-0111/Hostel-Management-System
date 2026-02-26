import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, XCircle, User, MapPin, FileText, Search } from "lucide-react";
import { toast } from "react-hot-toast";

export default function WardenLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleAction = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/leaves/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast.success(`Leave request ${status.toLowerCase()}`);
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      } else {
        toast.error("Failed to update leave status");
      }
    } catch (err) {
      toast.error("Failed to update leave status");
    }
  };

  const filteredLeaves = leaves.filter(l =>
    l.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Leave Management</h2>
          <p className="text-gray-500 text-sm">Review and approve student out-of-campus requests</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading leave requests...</div>
        ) : filteredLeaves.length > 0 ? filteredLeaves.map((leave, i) => (
          <motion.div
            key={leave.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 rounded-2xl glass-panel border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leave.studentName}`} className="w-12 h-12 rounded-full border border-white/10" alt="avatar" />
                  <div>
                    <h4 className="font-bold text-white text-lg">{leave.studentName}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                          leave.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                        {leave.status}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> Applied {new Date(leave.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Duration</p>
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Calendar size={14} className="text-blue-400" />
                      {new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Reason</p>
                    <p className="text-sm text-gray-300 flex items-center gap-2 italic">
                      <FileText size={14} className="text-purple-400" />
                      "{leave.reason}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {leave.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleAction(leave.id, 'Rejected')}
                      className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                    <button
                      onClick={() => handleAction(leave.id, 'Approved')}
                      className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-glow flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                  </>
                )}
                {leave.status !== 'Pending' && (
                  <button className="w-full lg:w-auto px-6 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:text-white transition-all">
                    View History
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center text-gray-500 italic bg-white/5 rounded-2xl border border-dashed border-white/10">
            No leave requests found.
          </div>
        )}
      </div>
    </div>
  );
}
