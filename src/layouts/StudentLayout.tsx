import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, CreditCard, MessageCircle, FileText, LogOut, GraduationCap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/student" },
    { icon: User, label: "My Profile", path: "/student/profile" },
    { icon: CreditCard, label: "Fees & Payments", path: "/student/fees" },
    { icon: MessageCircle, label: "Complaints", path: "/student/complaints" },
    { icon: FileText, label: "Leave Requests", path: "/student/leaves" },
  ];

  return (
    <div className="flex h-screen bg-background-dark overflow-hidden">
      <aside className="w-64 border-r border-white/10 bg-surface-dark/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-glow">
            <GraduationCap className="text-white" size={20} />
          </div>
          <h1 className="font-bold text-xl text-white">Student<span className="text-violet-400">Portal</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? "bg-violet-400/10 text-violet-400 border border-violet-400/20"
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
          <h2 className="text-xl font-bold text-white">Welcome, {user?.name.split(' ')[0]}</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-violet-400">
              <User size={20} />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
