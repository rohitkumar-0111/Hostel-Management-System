import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, User, GraduationCap, RefreshCw } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"admin" | "warden" | "student">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [feesPaid, setFeesPaid] = useState("");
  const [roommateCount, setRoommateCount] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");

  // Avatar selection state
  const avatarStyles = ["bottts", "adventurer", "micah", "avataaars"];
  const [avatarStyle, setAvatarStyle] = useState(avatarStyles[0]);
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString(36).substring(7));
  const selectedAvatar = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}`;

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const body = isLogin
      ? { email, password, role }
      : { name, email, password, role, roomNumber, feesPaid: parseFloat(feesPaid) || 0, gender, avatar: selectedAvatar };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user);
        toast.success(`${isLogin ? "Welcome back" : "Account created"}, ${data.user.name}!`);
        navigate(`/${data.user.role}`);
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const roleThemes = {
    admin: "from-indigo-600 to-purple-700",
    warden: "from-blue-600 to-cyan-700",
    student: "from-violet-600 to-fuchsia-700",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark relative overflow-hidden">
      {/* Aurora Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${roleThemes[role]} opacity-20 blur-[100px] transition-all duration-700`} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Hostel OS</h1>
          <p className="text-gray-400">{isLogin ? "Manage your campus with precision" : "Join our campus community"}</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {(["admin", "warden", "student"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${role === r ? "bg-white/10 text-white scale-110" : "text-gray-500 hover:text-gray-300"
                }`}
            >
              {r === "admin" && <Shield size={24} />}
              {r === "warden" && <User size={24} />}
              {r === "student" && <GraduationCap size={24} />}
              <span className="text-xs capitalize">{r}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Avatar Selection */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group">
                    <img
                      src={selectedAvatar}
                      alt="Selected Avatar"
                      className={`w-24 h-24 rounded-full border-4 border-${roleThemes[role].split('-')[1]}-500/50 bg-white/5 object-cover transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                      className="absolute -bottom-2 -right-2 p-2 rounded-full bg-surface-dark border border-white/10 text-white hover:text-primary hover:scale-110 transition-all shadow-xl"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>

                  <div className="flex gap-2 justify-center flex-wrap">
                    {avatarStyles.map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setAvatarStyle(style)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${avatarStyle === style
                          ? `bg-${roleThemes[role].split('-')[1]}-500/20 border-${roleThemes[role].split('-')[1]}-500 text-white`
                          : 'border-white/10 text-gray-400 hover:text-gray-200'
                          }`}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>

                {role === "student" && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Room Number</label>
                      <input
                        type="text"
                        required
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="B-204"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fees Paid (₹)</label>
                      <input
                        type="number"
                        required
                        value={feesPaid}
                        onChange={(e) => setFeesPaid(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="15000"
                      />
                    </div>
                  </div>
                )}

                {role === "student" && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Number of Roommates</label>
                      <input
                        type="number"
                        required
                        value={roommateCount}
                        onChange={(e) => setRoommateCount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="e.g. 2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      >
                        <option value="Male" className="bg-surface-dark">Male</option>
                        <option value="Female" className="bg-surface-dark">Female</option>
                        <option value="Other" className="bg-surface-dark">Other</option>
                      </select>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl bg-gradient-to-r ${roleThemes[role]} text-white font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50`}
          >
            {loading ? "Processing..." : `${isLogin ? "Login" : "Sign Up"} as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
