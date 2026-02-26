import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, AlertCircle, CheckCircle, Clock, User, Home, Filter } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminComplaints() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

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

    const updateStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`/api/complaints/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success(`Complaint status updated to ${status}`);
                setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
            } else {
                toast.error("Failed to update status");
            }
        } catch (err) {
            toast.error("Failed to update status");
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

    const filteredComplaints = filter === "All"
        ? complaints
        : complaints.filter(c => c.status === filter);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Central Complaints Oversight</h2>
                    <p className="text-gray-500 text-sm">Monitor issues reported to wardens system-wide.</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                    {["All", "Submitted", "InProgress", "Resolved"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center text-gray-500">Loading central complaints...</div>
                ) : filteredComplaints.length > 0 ? filteredComplaints.map((complaint, i) => (
                    <motion.div
                        key={complaint.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-6 rounded-2xl glass-panel border border-white/10 hover:bg-white/10 transition-all group"
                    >
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl ${complaint.category === 'Maintenance' ? 'bg-amber-500/10 text-amber-500' :
                                            complaint.category === 'Security' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-lg text-white">{complaint.category}</h4>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(complaint.status)}`}>
                                                {complaint.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                <User size={14} /> {complaint.studentName || "Student"}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                <Home size={14} /> Room: {complaint.roomNumber || "N/A"}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                <Clock size={14} /> {new Date(complaint.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                    {complaint.description}
                                </p>
                            </div>

                            <div className="flex flex-row lg:flex-col justify-end gap-2">
                                {complaint.status === 'Submitted' && (
                                    <button
                                        onClick={() => updateStatus(complaint.id, 'InProgress')}
                                        className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500 hover:text-white transition-all"
                                    >
                                        Mark In Progress
                                    </button>
                                )}
                                {complaint.status !== 'Resolved' && (
                                    <button
                                        onClick={() => updateStatus(complaint.id, 'Resolved')}
                                        className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                        Resolve Issue
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="py-20 text-center text-gray-500 italic bg-white/5 rounded-2xl border border-dashed border-white/10">
                        No complaints found matching criteria.
                    </div>
                )}
            </div>
        </div>
    );
}
