import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bed, UserPlus, Search, Filter, CheckCircle, AlertCircle, Home, User } from "lucide-react";
import { toast } from "react-hot-toast";

export default function WardenAllocations() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/warden/students")
      .then(res => res.json())
      .then(data => {
        setStudents(data.students || []);
        setLoading(false);
      });
  }, []);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAllocate = async (studentId: number, currentRoom: string | null) => {
    const newRoom = window.prompt("Enter new Room Number:", currentRoom || "");
    if (!newRoom || newRoom === currentRoom) return;

    try {
      const res = await fetch("/api/warden/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, roomNumber: newRoom })
      });
      if (res.ok) {
        toast.success("Student room allocated successfully");
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, roomNumber: newRoom } : s));
      } else {
        toast.error("Failed to allocate student");
      }
    } catch (err) {
      toast.error("An error occurred during allocation");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Room Allocations</h2>
          <p className="text-gray-500 text-sm">Assign and manage student room placements</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => toast("Please click 'Allocate' next to a student below!", { icon: "💡" })}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all shadow-glow">
            <UserPlus size={18} />
            <span>New Allocation</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-panel bg-gradient-to-br from-blue-500/10 to-transparent">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Students</p>
          <h3 className="text-3xl font-bold text-white">{students.length}</h3>
        </div>
        <div className="p-6 rounded-2xl glass-panel bg-gradient-to-br from-emerald-500/10 to-transparent">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Allocated</p>
          <h3 className="text-3xl font-bold text-white">{students.filter(s => s.roomNumber).length}</h3>
        </div>
        <div className="p-6 rounded-2xl glass-panel bg-gradient-to-br from-amber-500/10 to-transparent">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Unallocated</p>
          <h3 className="text-3xl font-bold text-white">{students.filter(s => !s.roomNumber).length}</h3>
        </div>
      </div>

      <div className="p-8 rounded-2xl glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">
                <th className="pb-4 font-medium">Student</th>
                <th className="pb-4 font-medium">Room Number</th>
                <th className="pb-4 font-medium">Gender</th>
                <th className="pb-4 font-medium">Verification</th>
                <th className="pb-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">Loading students...</td>
                </tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} className="w-10 h-10 rounded-full border border-white/10" alt="avatar" />
                      <div>
                        <p className="text-sm font-bold text-white">{student.name}</p>
                        <p className="text-[10px] text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    {student.roomNumber ? (
                      <div className="flex items-center gap-2 text-sm text-gray-300 font-mono">
                        <Home size={14} className="text-blue-400" />
                        {student.roomNumber}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-500 italic">Not Assigned</span>
                    )}
                  </td>
                  <td className="py-4 text-sm text-gray-400 capitalize">{student.gender || "N/A"}</td>
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
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleAllocate(student.id, student.roomNumber)}
                      className="px-4 py-2 rounded-lg bg-white/5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                      {student.roomNumber ? "Reallocate" : "Allocate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
