import React, { useEffect, useState } from "react";
import { Search, UserCheck, AlertCircle, Home } from "lucide-react";

export default function AdminStudents() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch("/api/admin/students")
            .then(res => res.json())
            .then(data => {
                setStudents(data.students || []);
                setLoading(false);
            });
    }, []);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Student Directory</h2>
                    <p className="text-gray-500 text-sm">Manage all students registered in the system</p>
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

            <div className="p-8 rounded-2xl glass-panel">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">
                                <th className="pb-4 font-medium">Student Info</th>
                                <th className="pb-4 font-medium">Room</th>
                                <th className="pb-4 font-medium">Financial Status</th>
                                <th className="pb-4 font-medium">Verification</th>
                                <th className="pb-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">Loading directory...</td>
                                </tr>
                            ) : filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                                                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 object-cover"
                                                alt="avatar"
                                            />
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
                                            <span className="text-xs text-amber-500 italic">Unallocated</span>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        <p className="text-sm font-bold text-emerald-400">₹{student.feesPaid || 0}</p>
                                        <p className="text-[10px] text-gray-500 uppercase">Paid</p>
                                    </td>
                                    <td className="py-4">
                                        {student.isVerified ? (
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase">
                                                <UserCheck size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase">
                                                <AlertCircle size={12} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 text-right">
                                        <button className="px-4 py-2 rounded-lg bg-white/5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                            View full Profile
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">No students found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
