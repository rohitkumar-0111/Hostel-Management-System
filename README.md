# Hostel Management System

A comprehensive, full-stack web application designed to streamline the administration, warden oversight, and student experience of modern university hostels. Built with a modern React frontend and a fast Node.js/SQLite backend.

## 🌟 Features

- **Admin Command Center**: Complete oversight of all hostel metrics, student directories, financial revenues, and centralized complaint management.
- **Warden Dashboard**: Dedicated portals for wardens to track student attendance, approve/reject absence leaves, allocate students to specific rooms, and resolve maintenance or security issues.
- **Student Portal**: Empowering students to monitor their fee payments, submit maintenance requests with live status tracking, apply for temporary leave, and check their room assignments.
- **Role-Based Authentication**: Secure login system with specific access scopes for Students, Wardens, and super-Admins using encrypted JWT tokens.
- **Real-Time Data**: Dynamic analytics and occupancy graphs powered by a local SQLite database that instantly updates across all dashboards.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Framer Motion (Animations), Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: `better-sqlite3` (File-based local SQL database).
- **Security**: `bcryptjs` for password hashing, `jsonwebtoken` for secure session cookies.

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourUsername/Hostel-Management.git
   cd Hostel-Management
   ```

2. **Install all dependencies:**
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (or copy `.env.example` if available) and define a secure JWT secret:
   ```env
   JWT_SECRET="your_super_secret_string_here"
   ```

4. **Start the Development Server:**
   This command will concurrently launch both the Vite frontend and the Node.js backend.
   ```bash
   npm run dev
   ```

5. **First-Time Setup (Database Seeding):**
   The application will automatically generate a `hostel.db` SQLite file locally upon launch. The backend automatically seeds the system with a default set of rooms, students, and a Super Admin!

---

## 🔑 Default Login Credentials

Upon running `npm run dev` for the first time, the database scripts will create default accounts so you can test every panel immediately.

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@hostelos.com` | `admin123` |
| **Warden** | `warden@hostelos.com` | `warden123` |
| **Student** | `student@hostelos.com` | `student123` |

Navigate to `http://localhost:3000` to log in!
