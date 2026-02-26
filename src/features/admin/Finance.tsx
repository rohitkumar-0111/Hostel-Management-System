import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Search } from "lucide-react";

export default function AdminFinance() {
    const [finance, setFinance] = useState<any>({ payments: [], totalRevenue: 0, pendingDues: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch("/api/admin/finance")
            .then(res => res.json())
            .then(data => {
                setFinance(data);
                setLoading(false);
            });
    }, []);

    const filteredPayments = finance.payments.filter((p: any) =>
        p.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Financial Hub</h2>
                    <p className="text-gray-500 text-sm">Monitor revenue, pending dues, and view transaction history</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl glass-panel relative overflow-hidden group bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-white mt-1">₹{finance.totalRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl glass-panel relative overflow-hidden group bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Pending Dues</p>
                            <h3 className="text-3xl font-bold text-white mt-1">₹{finance.pendingDues.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl glass-panel relative overflow-hidden group bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Transactions</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{finance.payments.length}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="p-8 rounded-2xl glass-panel">
                <h3 className="font-bold text-lg text-white mb-6">Recent Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">
                                <th className="pb-4 font-medium">Student / TRX ID</th>
                                <th className="pb-4 font-medium">Amount</th>
                                <th className="pb-4 font-medium">Due Date</th>
                                <th className="pb-4 font-medium">Payment Date</th>
                                <th className="pb-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">Loading records...</td>
                                </tr>
                            ) : filteredPayments.length > 0 ? filteredPayments.map((payment: any, i: number) => (
                                <tr key={payment.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${payment.studentName}`}
                                                className="w-8 h-8 rounded-full border border-white/10"
                                                alt="avatar"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-white">{payment.studentName}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">TRX: {payment.transactionId || "N/A"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 font-bold text-white">₹{payment.amount}</td>
                                    <td className="py-4 text-sm text-gray-400">{new Date(payment.dueDate).toLocaleDateString()}</td>
                                    <td className="py-4 text-sm text-gray-400">{payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : "—"}</td>
                                    <td className="py-4">
                                        {payment.status === "Paid" ? (
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase w-max px-2 py-1 rounded bg-emerald-500/10">
                                                <CheckCircle size={12} /> Paid
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase w-max px-2 py-1 rounded bg-amber-500/10">
                                                <AlertCircle size={12} /> {payment.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500 italic">No payment records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
