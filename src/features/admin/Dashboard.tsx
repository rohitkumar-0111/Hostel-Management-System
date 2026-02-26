import { useEffect, useState } from "react";
import { Users, Hotel, AlertCircle, TrendingUp, Star, Bed } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div className="text-gray-500">Loading metrics...</div>;

  const kpiCards = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Total Revenue", value: `₹${(stats.pendingFees / 1000).toFixed(1)}k`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Pending Issues", value: stats.openComplaints, icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Total Rooms", value: stats.totalRooms, icon: Bed, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const occupancyData = [
    { name: "Occupied", value: stats.occupiedRooms, color: "#6366f1" },
    { name: "Vacant", value: stats.vacantRooms, color: "#374151" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl glass-panel relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -top-4 w-20 h-20 ${card.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">{card.label}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">↑ 12%</span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-2xl glass-panel flex flex-col md:flex-row items-center gap-12">
          <div className="w-64 h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-white">
                {Math.round((stats.occupiedRooms / stats.totalRooms) * 100)}%
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-widest">Occupancy</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            {occupancyData.map(item => (
              <div key={item.name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-400">{item.name}</span>
                </div>
                <p className="text-2xl font-bold text-white">{item.value}</p>
              </div>
            ))}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-gray-400">Maintenance</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.maintenanceRooms || 0}</p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl glass-panel">
          <h3 className="font-bold text-lg text-white mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {(stats.recentActivity && stats.recentActivity.length > 0 ? stats.recentActivity : []).map((activity: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${activity.color} mt-2 ring-4 ring-white/5`} />
                  {i !== 3 && <div className="absolute top-4 left-1 w-px h-full bg-white/10" />}
                </div>
                <div>
                  <p className="text-sm text-gray-200 font-medium">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
