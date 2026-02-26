import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bed, ClipboardCheck, AlertCircle, Calendar, User, CheckCircle, XCircle } from "lucide-react";

export default function WardenDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/warden/students")
      .then(res => res.json())
      .then(data => {
        setStudents(data.students || []);
      });

    fetch("/api/warden/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });

    fetch("/api/complaints")
      .then(res => res.json())
      .then(data => {
        setRecentComplaints((data.complaints || []).slice(0, 3));
      });
  }, []);

  const cards = [
    { label: "Total Students", value: students.length, icon: User, color: "text-blue-400" },
    { label: "Pending Leaves", value: stats?.pendingLeaves || 0, icon: Calendar, color: "text-purple-400" },
    { label: "Open Complaints", value: stats?.openComplaints || 0, icon: AlertCircle, color: "text-orange-400" },
    { label: "Attendance Today", value: "94%", icon: ClipboardCheck, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl glass-panel"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">{card.label}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-2xl glass-panel">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-white">Student Directory</h3>
            <button className="text-xs text-blue-400 font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">
                  <th className="pb-4 font-medium">Student</th>
                  <th className="pb-4 font-medium">Room</th>
                  <th className="pb-4 font-medium">Fees Paid</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((student) => (
                  <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} className="w-8 h-8 rounded-full border border-white/10 bg-white/5 object-cover" alt="avatar" />
                        <div>
                          <p className="text-sm font-bold text-white">{student.name}</p>
                          <p className="text-[10px] text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-300 font-mono">{student.roomNumber || "N/A"}</td>
                    <td className="py-4 text-sm text-emerald-400 font-bold">₹{student.feesPaid}</td>
                    <td className="py-4">
                      {student.isVerified ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase">
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase">
                          <AlertCircle size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <button className="text-xs text-gray-400 hover:text-white transition-colors">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && !loading && (
              <div className="py-12 text-center text-gray-500 italic">No students registered yet.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-2xl glass-panel">
            <h3 className="font-bold text-lg text-white mb-6">Recent Complaints</h3>
            <div className="space-y-4">
              {recentComplaints.length > 0 ? recentComplaints.map((complaint, i) => (
                <div key={complaint.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-white">{complaint.category}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${complaint.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">Room: {complaint.roomNumber || "N/A"}</p>
                    <button className="text-xs text-blue-400 font-bold hover:underline">View</button>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center text-gray-500 italic text-sm">No recent complaints.</div>
              )}
            </div>
          </div>

          <div className="p-8 rounded-2xl glass-panel">
            <h3 className="font-bold text-lg text-white mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Verified Students</span>
                <span className="text-sm font-bold text-white">{students.filter(s => s.isVerified).length}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${students.length ? (students.filter(s => s.isVerified).length / students.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
