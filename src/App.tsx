import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./features/auth/Login";
import AdminLayout from "./layouts/AdminLayout";
import WardenLayout from "./layouts/WardenLayout";
import StudentLayout from "./layouts/StudentLayout";
import AdminDashboard from "./features/admin/Dashboard";
import AdminStudents from "./features/admin/Students";
import AdminRooms from "./features/admin/Rooms";
import AdminFinance from "./features/admin/Finance";
import AdminComplaints from "./features/admin/Complaints";
import WardenDashboard from "./features/warden/Dashboard";
import WardenAllocations from "./features/warden/Allocations";
import WardenAttendance from "./features/warden/Attendance";
import WardenComplaints from "./features/warden/Complaints";
import WardenLeaves from "./features/warden/Leaves";
import StudentDashboard from "./features/student/Dashboard";
import StudentProfile from "./features/student/Profile";
import StudentFees from "./features/student/Fees";
import StudentComplaints from "./features/student/Complaints";
import StudentLeaves from "./features/student/Leaves";
import StudentRoomChange from "./features/student/RoomChange";
import { useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles: string[] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-background-dark text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="complaints" element={<AdminComplaints />} />
        </Route>

        {/* Warden Routes */}
        <Route path="/warden" element={
          <ProtectedRoute roles={["warden"]}>
            <WardenLayout />
          </ProtectedRoute>
        }>
          <Route index element={<WardenDashboard />} />
          <Route path="allocations" element={<WardenAllocations />} />
          <Route path="attendance" element={<WardenAttendance />} />
          <Route path="complaints" element={<WardenComplaints />} />
          <Route path="leaves" element={<WardenLeaves />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute roles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="complaints" element={<StudentComplaints />} />
          <Route path="leaves" element={<StudentLeaves />} />
          <Route path="room-change" element={<StudentRoomChange />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
