import React, { useEffect, useState } from "react";
import { Bed, Users, Filter, Plus, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminRooms() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/rooms")
            .then(res => res.json())
            .then(data => {
                setRooms(data.rooms || []);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Vacant": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Occupied": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "Maintenance": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            default: return "bg-gray-500/10 text-gray-400";
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Room Inventory</h2>
                    <p className="text-gray-500 text-sm">Manage hostel floors, capacity, and current occupancies.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/80 transition-all shadow-glow">
                    <Plus size={18} />
                    <span>Add New Room</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-500">Loading rooms...</div>
                ) : rooms.map((room, i) => (
                    <motion.div
                        key={room.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-6 rounded-2xl glass-panel relative overflow-hidden group border ${getStatusColor(room.status).split(' ')[2]}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${getStatusColor(room.status).split(' ')[0]} ${getStatusColor(room.status).split(' ')[1]}`}>
                                    <Home size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white font-mono">{room.roomNumber}</h3>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Floor {room.floor}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(room.status)}`}>
                                {room.status}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 flex items-center gap-2"><Bed size={14} /> Type</span>
                                <span className="text-white font-medium">{room.type}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 flex items-center gap-2"><Users size={14} /> Occupancy</span>
                                <span className="text-white font-medium">
                                    {room.currentOccupancy} / {room.capacity}
                                </span>
                            </div>

                            {/* Progress Bar for Capacity */}
                            <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${room.currentOccupancy === room.capacity ? 'bg-amber-500' : 'bg-primary'}`}
                                    style={{ width: `${(room.currentOccupancy / room.capacity) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5">
                            <button className="w-full text-center text-xs font-bold text-gray-400 hover:text-white transition-colors">
                                Manage Room
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
