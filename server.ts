import express from "express";
import { createServer as createViteServer } from "vite";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In production (Render), check if the /data persistent disk is actually mounted.
let dbPath = "hostel.db";
if (process.env.NODE_ENV === "production" && fs.existsSync("/data")) {
  dbPath = "/data/hostel.db";
} else if (process.env.NODE_ENV === "production") {
  console.warn("WARNING: /data directory not found! SQLite will not be saved permanently.");
}

const db = new Database(dbPath);

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'warden', 'student')) NOT NULL,
    phone TEXT,
    avatar TEXT,
    roomNumber TEXT,
    feesPaid REAL DEFAULT 0,
    gender TEXT,
    isVerified INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hostels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('Boys', 'Girls')) NOT NULL,
    totalFloors INTEGER,
    description TEXT,
    createdBy INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(createdBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roomNumber TEXT NOT NULL,
    hostelId INTEGER,
    floor INTEGER,
    type TEXT CHECK(type IN ('Single', 'Double', 'Triple')) NOT NULL,
    capacity INTEGER,
    currentOccupancy INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('Vacant', 'Occupied', 'Maintenance')) DEFAULT 'Vacant',
    FOREIGN KEY(hostelId) REFERENCES hostels(id)
  );

  CREATE TABLE IF NOT EXISTS allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER,
    roomId INTEGER,
    allocatedBy INTEGER,
    allocatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    isActive INTEGER DEFAULT 1,
    FOREIGN KEY(studentId) REFERENCES users(id),
    FOREIGN KEY(roomId) REFERENCES rooms(id),
    FOREIGN KEY(allocatedBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS fee_structure (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    components TEXT, -- JSON string
    billingCycle TEXT,
    totalAmount REAL,
    academicYear TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER,
    amount REAL,
    dueDate DATETIME,
    paidDate DATETIME,
    status TEXT CHECK(status IN ('Paid', 'Pending', 'Overdue', 'Partial')) DEFAULT 'Pending',
    transactionId TEXT,
    paymentGatewayResponse TEXT,
    FOREIGN KEY(studentId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER,
    roomId INTEGER,
    roomNumber TEXT,
    category TEXT,
    description TEXT,
    photo TEXT,
    status TEXT CHECK(status IN ('Submitted', 'Assigned', 'InProgress', 'Resolved')) DEFAULT 'Submitted',
    assignedTo INTEGER,
    updates TEXT, -- JSON string
    feedbackRating INTEGER,
    feedbackComment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(studentId) REFERENCES users(id),
    FOREIGN KEY(roomId) REFERENCES rooms(id),
    FOREIGN KEY(assignedTo) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER,
    fromDate DATETIME,
    toDate DATETIME,
    reason TEXT,
    status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    approvedBy INTEGER,
    rejectionReason TEXT,
    appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(studentId) REFERENCES users(id),
    FOREIGN KEY(approvedBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE,
    hostelId INTEGER,
    markedBy INTEGER,
    records TEXT, -- JSON string [{studentId, status, time}]
    FOREIGN KEY(hostelId) REFERENCES hostels(id),
    FOREIGN KEY(markedBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    type TEXT CHECK(type IN ('General', 'Emergency', 'Rule')) DEFAULT 'General',
    isPinned INTEGER DEFAULT 0,
    postedBy INTEGER,
    readBy TEXT, -- JSON string [userIds]
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(postedBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER,
    type TEXT,
    severity TEXT CHECK(severity IN ('Yellow', 'Orange', 'Red')),
    description TEXT,
    issuedBy INTEGER,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(studentId) REFERENCES users(id),
    FOREIGN KEY(issuedBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS room_change_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER,
    currentRoom TEXT,
    requestedRoom TEXT,
    reason TEXT,
    status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(studentId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    performedBy INTEGER,
    targetModel TEXT,
    targetId INTEGER,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(performedBy) REFERENCES users(id)
  );
`);

// Migration: Add missing columns to users table if they don't exist
const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
const columnNames = tableInfo.map(col => col.name);

if (!columnNames.includes("roomNumber")) {
  db.exec("ALTER TABLE users ADD COLUMN roomNumber TEXT");
}
if (!columnNames.includes("feesPaid")) {
  db.exec("ALTER TABLE users ADD COLUMN feesPaid REAL DEFAULT 0");
}
if (!columnNames.includes("gender")) {
  db.exec("ALTER TABLE users ADD COLUMN gender TEXT");
}

// Migration for complaints table
const complaintTableInfo = db.prepare("PRAGMA table_info(complaints)").all() as any[];
const complaintColumnNames = complaintTableInfo.map(col => col.name);
if (!complaintColumnNames.includes("roomNumber")) {
  db.exec("ALTER TABLE complaints ADD COLUMN roomNumber TEXT");
}

// Seed Initial Admin if not exists
const adminEmail = "admin@hostelos.com";
const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync("admin123", 12);
  db.prepare("INSERT INTO users (name, email, password, role, isVerified) VALUES (?, ?, ?, ?, ?)").run(
    "Super Admin",
    adminEmail,
    hashedPassword,
    "admin",
    1
  );
  console.log("Seeded default admin: admin@hostelos.com / admin123");
}

// Seed Rooms if Empty
const roomsExist = db.prepare("SELECT COUNT(*) as count FROM rooms").get() as any;
if (roomsExist.count === 0) {
  console.log("Seeding default rooms...");
  const insertRoom = db.prepare("INSERT INTO rooms (roomNumber, floor, type, capacity, currentOccupancy, status) VALUES (?, ?, ?, ?, ?, ?)");

  insertRoom.run("101", 1, "Single", 1, 0, "Vacant");
  insertRoom.run("102", 1, "Double", 2, 0, "Vacant");
  insertRoom.run("103", 1, "Triple", 3, 0, "Vacant");
  insertRoom.run("201", 2, "Single", 1, 0, "Vacant");
  insertRoom.run("202", 2, "Double", 2, 0, "Vacant");
  insertRoom.run("203", 2, "Triple", 3, 0, "Maintenance");
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());
  app.use(cookieParser());

  const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  const authorize = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // API Routes
  app.post("/api/auth/signup", (req, res) => {
    const { name, email, password, role, roomNumber, feesPaid, gender, avatar } = req.body;

    // Check if user already exists
    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 12);
    try {
      const result = db.prepare("INSERT INTO users (name, email, password, role, roomNumber, feesPaid, gender, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
        name,
        email,
        hashedPassword,
        role,
        roomNumber || null,
        feesPaid || 0,
        gender || null,
        avatar || null
      );

      const user = { id: result.lastInsertRowid, name, email, role, roomNumber, feesPaid, gender, avatar };
      const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "1h" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });

      res.status(201).json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password, role } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ? AND role = ?").get(email, role);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user: { id: user.id, name: user.name, role: user.role, email: user.email, avatar: user.avatar, roomNumber: user.roomNumber, feesPaid: user.feesPaid, gender: user.gender } });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticate, (req: any, res) => {
    const user = db.prepare("SELECT id, name, email, role, roomNumber, feesPaid, gender, avatar FROM users WHERE id = ?").get(req.user.id);
    res.json({ user });
  });

  app.put("/api/users/avatar", authenticate, (req: any, res) => {
    const { avatar } = req.body;
    try {
      db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatar, req.user.id);
      res.json({ message: "Avatar updated successfully", avatar });
    } catch (err) {
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });

  // Student Roommates
  app.get("/api/student/roommates", authenticate, authorize(["student"]), (req: any, res) => {
    const user: any = db.prepare("SELECT roomNumber FROM users WHERE id = ?").get(req.user.id);
    if (!user || !user.roomNumber) return res.json({ roommates: [] });

    const roommates = db.prepare("SELECT id, name, avatar FROM users WHERE roomNumber = ? AND id != ?").all(user.roomNumber, req.user.id);
    res.json({ roommates });
  });

  // Complaints
  app.post("/api/complaints", authenticate, authorize(["student"]), (req: any, res) => {
    const { category, description } = req.body;
    const user: any = db.prepare("SELECT roomNumber FROM users WHERE id = ?").get(req.user.id);

    try {
      db.prepare("INSERT INTO complaints (studentId, roomNumber, category, description) VALUES (?, ?, ?, ?)").run(
        req.user.id,
        user.roomNumber || "N/A",
        category,
        description
      );
      res.status(201).json({ message: "Complaint submitted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to submit complaint" });
    }
  });

  app.get("/api/complaints", authenticate, (req: any, res) => {
    let complaints;
    if (req.user.role === "student") {
      complaints = db.prepare("SELECT * FROM complaints WHERE studentId = ? ORDER BY createdAt DESC").all(req.user.id);
    } else {
      complaints = db.prepare("SELECT c.*, u.name as studentName FROM complaints c JOIN users u ON c.studentId = u.id ORDER BY c.createdAt DESC").all();
    }
    res.json({ complaints });
  });

  app.put("/api/complaints/:id/status", authenticate, authorize(["warden", "admin"]), (req: any, res) => {
    const { status } = req.body;
    try {
      db.prepare("UPDATE complaints SET status = ? WHERE id = ?").run(status, req.params.id);
      res.json({ message: "Complaint status updated successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to update complaint status" });
    }
  });

  // Leaves
  app.post("/api/leaves", authenticate, authorize(["student"]), (req: any, res) => {
    const { fromDate, toDate, reason } = req.body;
    try {
      db.prepare("INSERT INTO leaves (studentId, fromDate, toDate, reason) VALUES (?, ?, ?, ?)").run(
        req.user.id,
        fromDate,
        toDate,
        reason
      );
      res.status(201).json({ message: "Leave request submitted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to submit leave request" });
    }
  });

  app.get("/api/leaves", authenticate, (req: any, res) => {
    let leaves;
    if (req.user.role === "student") {
      leaves = db.prepare("SELECT * FROM leaves WHERE studentId = ? ORDER BY appliedAt DESC").all(req.user.id);
    } else {
      leaves = db.prepare("SELECT l.*, u.name as studentName FROM leaves l JOIN users u ON l.studentId = u.id ORDER BY l.appliedAt DESC").all();
    }
    res.json({ leaves });
  });

  app.put("/api/leaves/:id/status", authenticate, authorize(["warden", "admin"]), (req: any, res) => {
    const { status } = req.body;
    try {
      db.prepare("UPDATE leaves SET status = ?, approvedBy = ? WHERE id = ?").run(status, req.user.id, req.params.id);
      res.json({ message: "Leave request status updated successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to update leave request status" });
    }
  });

  // Payments
  app.get("/api/student/payments", authenticate, authorize(["student"]), (req: any, res) => {
    const payments = db.prepare("SELECT * FROM payments WHERE studentId = ? ORDER BY dueDate DESC").all(req.user.id);
    res.json({ payments });
  });

  // Room Change Requests
  app.post("/api/room-change", authenticate, authorize(["student"]), (req: any, res) => {
    const { requestedRoom, reason } = req.body;
    const user: any = db.prepare("SELECT roomNumber FROM users WHERE id = ?").get(req.user.id);
    try {
      db.prepare("INSERT INTO room_change_requests (studentId, currentRoom, requestedRoom, reason) VALUES (?, ?, ?, ?)").run(
        req.user.id,
        user.roomNumber || "N/A",
        requestedRoom,
        reason
      );
      res.status(201).json({ message: "Room change request submitted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to submit room change request" });
    }
  });

  app.get("/api/room-change", authenticate, (req: any, res) => {
    let requests;
    if (req.user.role === "student") {
      requests = db.prepare("SELECT * FROM room_change_requests WHERE studentId = ? ORDER BY appliedAt DESC").all(req.user.id);
    } else {
      requests = db.prepare("SELECT r.*, u.name as studentName FROM room_change_requests r JOIN users u ON r.studentId = u.id ORDER BY r.appliedAt DESC").all();
    }
    res.json({ requests });
  });

  // Warden Student Data
  app.get("/api/warden/students", authenticate, authorize(["warden"]), (req, res) => {
    const students = db.prepare("SELECT id, name, email, roomNumber, feesPaid, gender, isVerified FROM users WHERE role = 'student'").all();
    res.json({ students });
  });

  app.get("/api/warden/stats", authenticate, authorize(["warden"]), (req, res) => {
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get() as any;
    const openComplaints = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status != 'Resolved'").get() as any;
    const pendingLeaves = db.prepare("SELECT COUNT(*) as count FROM leaves WHERE status = 'Pending'").get() as any;

    res.json({
      totalStudents: totalStudents.count,
      openComplaints: openComplaints.count,
      pendingLeaves: pendingLeaves.count
    });
  });

  app.post("/api/warden/allocate", authenticate, authorize(["warden", "admin"]), (req: any, res) => {
    const { studentId, roomNumber } = req.body;
    try {
      db.prepare("UPDATE users SET roomNumber = ? WHERE id = ? AND role = 'student'").run(roomNumber, studentId);
      res.json({ message: "Student allocated successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to allocate student" });
    }
  });

  // Admin Dashboard Stats
  app.get("/api/admin/stats", authenticate, authorize(["admin"]), (req, res) => {
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get() as any;
    const totalRooms = db.prepare("SELECT COUNT(*) as count FROM rooms").get() as any;
    const occupiedRooms = db.prepare("SELECT COUNT(*) as count FROM rooms WHERE status = 'Occupied'").get() as any;
    const vacantRooms = db.prepare("SELECT COUNT(*) as count FROM rooms WHERE currentOccupancy = 0 AND status != 'Maintenance'").get() as any;
    const maintenanceRooms = db.prepare("SELECT COUNT(*) as count FROM rooms WHERE status = 'Maintenance'").get() as any;
    const pendingFees = db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'Pending'").get() as any;
    const openComplaints = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status != 'Resolved'").get() as any;

    const recentComplaints = db.prepare("SELECT category, description, createdAt FROM complaints ORDER BY createdAt DESC LIMIT 4").all();
    const recentActivity = recentComplaints.map((c: any) => ({
      type: "alert",
      text: `Issue: ${c.category} - ${c.description.substring(0, 20)}...`,
      time: new Date(c.createdAt).toLocaleDateString(),
      color: c.category === 'Maintenance' ? 'bg-amber-500' : 'bg-red-500'
    }));

    res.json({
      totalStudents: totalStudents.count,
      totalRooms: totalRooms.count,
      occupiedRooms: occupiedRooms.count,
      vacantRooms: vacantRooms.count,
      maintenanceRooms: maintenanceRooms.count,
      pendingFees: pendingFees.total || 0,
      openComplaints: openComplaints.count,
      recentActivity
    });
  });

  app.get("/api/admin/students", authenticate, authorize(["admin"]), (req, res) => {
    const students = db.prepare("SELECT id, name, email, roomNumber, feesPaid, gender, isVerified, avatar FROM users WHERE role = 'student'").all();
    res.json({ students });
  });

  app.get("/api/admin/rooms", authenticate, authorize(["admin"]), (req, res) => {
    const rooms = db.prepare("SELECT * FROM rooms").all();
    res.json({ rooms });
  });

  app.get("/api/admin/finance", authenticate, authorize(["admin"]), (req, res) => {
    const payments = db.prepare("SELECT p.*, u.name as studentName FROM payments p JOIN users u ON p.studentId = u.id ORDER BY p.dueDate DESC").all();
    const stats = {
      totalRevenue: db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'Paid'").get() as any,
      pendingDues: db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'Pending'").get() as any
    };

    res.json({
      payments,
      totalRevenue: stats.totalRevenue.total || 0,
      pendingDues: stats.pendingDues.total || 0
    });
  });

  // Socket.io
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("join", (room) => {
      socket.join(room);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = parseInt(process.env.PORT || "3000");
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
