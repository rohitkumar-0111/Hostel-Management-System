import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, Shield, CreditCard, Bed, RefreshCw, Save } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

export default function StudentProfile() {
  const { user, login } = useAuth();

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const avatarStyles = ["bottts", "adventurer", "micah", "avataaars"];
  const [avatarStyle, setAvatarStyle] = useState(avatarStyles[0]);
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString(36).substring(7));
  const selectedAvatar = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}`;
  const [savingAvatar, setSavingAvatar] = useState(false);

  const handleUpdateAvatar = async () => {
    setSavingAvatar(true);
    try {
      const res = await fetch("/api/users/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: selectedAvatar }),
      });
      if (res.ok) {
        toast.success("Avatar updated successfully!");
        if (user) {
          login({ ...user, avatar: selectedAvatar }); // Update the global auth state
        }
        setIsEditingAvatar(false);
      } else {
        toast.error("Failed to update avatar.");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSavingAvatar(false);
    }
  };

  const infoItems = [
    { label: "Full Name", value: user?.name, icon: User },
    { label: "Email Address", value: user?.email, icon: Mail },
    { label: "Role", value: user?.role, icon: Shield },
    { label: "Room Number", value: user?.roomNumber || "Not Assigned", icon: Bed },
    { label: "Fees Paid", value: `₹${user?.feesPaid || 0}`, icon: CreditCard },
    { label: "Gender", value: user?.gender || "Not Specified", icon: User },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="p-8 rounded-2xl glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <User size={120} />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group flex flex-col items-center">
            {isEditingAvatar ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedAvatar}
                    className="w-32 h-32 rounded-full border-4 border-violet-500/30 bg-white/5 object-cover shadow-2xl transition-transform"
                    alt="avatar preview"
                  />
                  <button
                    onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                    className="absolute -bottom-2 -right-2 p-2 rounded-full bg-surface-dark border border-white/10 text-white hover:text-violet-400 hover:scale-110 transition-all shadow-xl"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>

                <div className="flex gap-2 justify-center flex-wrap mt-2">
                  {avatarStyles.map(style => (
                    <button
                      key={style}
                      onClick={() => setAvatarStyle(style)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${avatarStyle === style
                          ? 'bg-violet-500/20 border-violet-500 text-white'
                          : 'border-white/10 text-gray-400 hover:text-gray-200'
                        }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={() => setIsEditingAvatar(false)}
                    className="flex-1 py-2 text-sm rounded-xl border border-white/10 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateAvatar}
                    disabled={savingAvatar}
                    className="flex-1 py-2 text-sm rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingAvatar ? "Saving..." : <><Save size={16} /> Save</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative cursor-pointer group" onClick={() => setIsEditingAvatar(true)}>
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  className="w-32 h-32 rounded-full border-4 border-violet-500/30 bg-white/5 object-cover shadow-2xl transition-transform group-hover:scale-105"
                  alt="avatar"
                />
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-4 border-transparent">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Change Avatar</span>
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-violet-500 border-4 border-background-dark flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>
            )}
          </div>

          <div className="text-center md:text-left mt-4 md:mt-0">
            <h2 className="text-3xl font-bold text-white mb-2">{user?.name}</h2>
            <p className="text-violet-400 font-medium uppercase tracking-wider text-sm">{user?.role} • Student ID: #{user?.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infoItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all"
          >
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{item.label}</p>
              <p className="text-white font-medium">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-8 rounded-2xl glass-panel">
        <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
        <div className="space-y-4">
          <button className="w-full py-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left px-6 flex justify-between items-center">
            <span>Change Password</span>
            <Shield size={18} />
          </button>
          <button className="w-full py-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left px-6 flex justify-between items-center">
            <span>Notification Preferences</span>
            <Calendar size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
