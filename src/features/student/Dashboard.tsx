import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bed, CreditCard, MessageCircle, FileText, Bell, User, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [roommates, setRoommates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/student/roommates")
      .then(res => res.json())
      .then(data => setRoommates(data.roommates || []));
  }, []);

  const stats = [
    { label: "Room Status", value: user?.roomNumber || "N/A", sub: user?.roomNumber ? "Occupied" : "Unallocated", icon: Bed, color: "text-violet-400" },
    { label: "Fees Paid", value: `₹${user?.feesPaid || 0}`, sub: "Total contributed", icon: CreditCard, color: "text-emerald-400" },
    { label: "Active Complaints", value: "1", sub: "In Progress", icon: MessageCircle, color: "text-amber-400" },
    { label: "Leave Balance", value: "12", sub: "Days remaining", icon: FileText, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl glass-panel relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-2xl glass-panel">
            <h3 className="font-bold text-lg text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link 
                to="/student/complaints"
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="p-3 rounded-xl bg-amber-500 text-white group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <span className="text-sm font-medium text-gray-300">Report Issue</span>
              </Link>
              <Link 
                to="/student/leaves"
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="p-3 rounded-xl bg-blue-500 text-white group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <span className="text-sm font-medium text-gray-300">Apply Leave</span>
              </Link>
              <Link 
                to="/student/room-change"
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="p-3 rounded-xl bg-violet-500 text-white group-hover:scale-110 transition-transform">
                  <Bed size={24} />
                </div>
                <span className="text-sm font-medium text-gray-300">Room Change</span>
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-2xl glass-panel">
            <h3 className="font-bold text-lg text-white mb-6">Recent Notices</h3>
            <div className="space-y-4">
              {[
                { title: "Hostel Maintenance Schedule", date: "Oct 24, 2023", tag: "Maintenance" },
                { title: "Annual Sports Meet Registration", date: "Oct 22, 2023", tag: "Event" },
                { title: "New Mess Menu for November", date: "Oct 20, 2023", tag: "Mess" },
              ].map((notice, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                      <Bell size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{notice.title}</p>
                      <p className="text-xs text-gray-500">{notice.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-white/10 text-gray-400">
                    {notice.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl glass-panel">
          <h3 className="font-bold text-lg text-white mb-6">My Roommates</h3>
          <div className="space-y-6">
            {roommates.length > 0 ? roommates.map((roommate, i) => (
              <div key={i} className="flex items-center gap-4">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${roommate.name}`} className="w-12 h-12 rounded-full border border-white/10" alt="avatar" />
                <div>
                  <p className="text-sm font-bold text-white">{roommate.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-xs text-gray-500">In Room</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 italic">No roommates found in your room.</p>
            )}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/5 transition-all">
            View Room Details
          </button>
        </div>
      </div>
    </div>
  );
}
