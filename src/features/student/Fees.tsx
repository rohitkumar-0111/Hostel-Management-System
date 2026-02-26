import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Receipt, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function StudentFees() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/student/payments")
      .then(res => res.json())
      .then(data => {
        if (data.payments && data.payments.length > 0) {
          setPayments(data.payments);
        } else {
          // Fallback to sample data if no real payments exist yet
          setPayments([
            { id: 1, amount: user?.feesPaid || 0, paidDate: "2023-10-15", status: "Paid", type: "Hostel Fee" },
            { id: 2, amount: 5000, dueDate: "2023-11-01", status: "Pending", type: "Mess Fee" },
          ]);
        }
      });
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl glass-panel bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Paid</p>
              <h3 className="text-4xl font-bold text-white mt-1">₹{user?.feesPaid || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle size={24} />
            </div>
          </div>
          <p className="text-xs text-emerald-500 font-medium">All clear for current semester</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-2xl glass-panel bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-400 font-medium">Pending Amount</p>
              <h3 className="text-4xl font-bold text-white mt-1">₹5,000</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-xs text-amber-500 font-medium">Due in 12 days</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-2xl glass-panel bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-400 font-medium">Next Payment</p>
              <h3 className="text-4xl font-bold text-white mt-1">₹12,000</h3>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/20 text-violet-400">
              <Receipt size={24} />
            </div>
          </div>
          <p className="text-xs text-violet-400 font-medium">Scheduled for Jan 2024</p>
        </motion.div>
      </div>

      <div className="p-8 rounded-2xl glass-panel">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-white">Payment History</h3>
          <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition-all">
            Download All Receipts
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/10">
                <th className="pb-4 font-bold">Transaction ID</th>
                <th className="pb-4 font-bold">Description</th>
                <th className="pb-4 font-bold">Date</th>
                <th className="pb-4 font-bold">Amount</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((payment) => (
                <tr key={payment.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-6 text-sm text-gray-400 font-mono">#TXN-00{payment.id}</td>
                  <td className="py-6">
                    <p className="text-sm font-bold text-white">{payment.type}</p>
                    <p className="text-xs text-gray-500">Semester 1 • 2023-24</p>
                  </td>
                  <td className="py-6 text-sm text-gray-400">{payment.paidDate || payment.dueDate || "N/A"}</td>
                  <td className="py-6 text-sm font-bold text-white">₹{payment.amount}</td>
                  <td className="py-6">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      payment.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-6 text-right">
                    <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                      <Receipt size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-violet-600 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <CreditCard size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Quick Pay</h3>
            <p className="text-violet-100">Pay your pending mess fees securely via UPI or Card.</p>
          </div>
        </div>
        <button className="px-8 py-4 rounded-xl bg-white text-violet-600 font-bold hover:bg-violet-50 transition-all shadow-xl">
          Pay ₹5,000 Now
        </button>
      </div>
    </div>
  );
}
