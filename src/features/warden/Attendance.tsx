import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Search, Check, X, User, Calendar, Save, Filter } from "lucide-react";
import { toast } from "react-hot-toast";

export default function WardenAttendance() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/warden/students")
      .then(res => res.json())
      .then(data => {
        const studentList = data.students || [];
        setStudents(studentList);
        // Initialize all as Present by default for convenience
        const initial: Record<number, string> = {};
        studentList.forEach((s: any) => initial[s.id] = "Present");
        setAttendance(initial);
        setLoading(false);
      });
  }, []);

  const toggleStatus = (id: number) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === "Present" ? "Absent" : "Present"
    }));
  };

  const handleSave = async () => {
    toast.success("Attendance marked successfully for " + new Date().toLocaleDateString());
    // In a real app, send to /api/attendance
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Daily Attendance</h2>
          <p className="text-gray-500 text-sm">Mark and track student presence in the hostel</p>
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
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-glow"
          >
            <Save size={18} />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="p-8 rounded-2xl glass-panel">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
              <p className="text-white font-bold">{new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Present</p>
              <p className="text-xl font-bold text-emerald-500">{Object.values(attendance).filter(v => v === "Present").length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Absent</p>
              <p className="text-xl font-bold text-red-500">{Object.values(attendance).filter(v => v === "Absent").length}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">
                <th className="pb-4 font-medium">Student</th>
                <th className="pb-4 font-medium">Room</th>
                <th className="pb-4 font-medium text-center">Status</th>
                <th className="pb-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">Loading students...</td>
                </tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} className="w-8 h-8 rounded-full border border-white/10" alt="avatar" />
                      <div>
                        <p className="text-sm font-bold text-white">{student.name}</p>
                        <p className="text-[10px] text-gray-500 capitalize">{student.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-300 font-mono">{student.roomNumber || "N/A"}</td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        attendance[student.id] === "Present" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {attendance[student.id]}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => toggleStatus(student.id)}
                      className={`p-2 rounded-lg transition-all ${
                        attendance[student.id] === "Present" 
                          ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" 
                          : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                      }`}
                    >
                      {attendance[student.id] === "Present" ? <X size={16} /> : <Check size={16} />}
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
