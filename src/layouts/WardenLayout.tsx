import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Bed, ClipboardCheck, MessageSquare, Calendar, LogOut, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";

export default function WardenLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/warden" },
    { icon: Bed, label: "Allocations", path: "/warden/allocations" },
    { icon: ClipboardCheck, label: "Attendance", path: "/warden/attendance" },
    { icon: MessageSquare, label: "Complaints", path: "/warden/complaints" },
    { icon: Calendar, label: "Leaves", path: "/warden/leaves" },
  ];

  return (
    <div className="flex h-screen bg-background-dark overflow-hidden">
      <aside className="w-64 border-r border-white/10 bg-surface-dark/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-glow">
            <User className="text-white" size={20} />
          </div>
          <h1 className="font-bold text-xl text-white">Warden<span className="text-blue-400">Panel</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 object-cover"
              alt="avatar"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-surface-dark/30 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white">Operations Dashboard</h2>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
            {new Date().toLocaleDateString("en-IN", { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
