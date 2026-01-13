# PM2 Monitor - Professional Tracker & Dashboard

**PM2 Monitor** is a modern, professional, and secure web interface for managing your PM2 ecosystem. It features a unique **Dual-View Architecture** that separates public monitoring from private administration.

---

## 🚀 Key Features

### 1. 🌐 Public Tracking Portal (Showcase Mode)
A high-performance, read-only dashboard accessible to unauthenticated users. Perfect for status pages or public transparency.
- **Worker Health Grid**: Real-time status of all connected servers/workers.
- **Live Metrics**: Instant view of **CPU Usage**, **RAM Usage**, and **Uptime** (Duration).
- **Availability History**: Visualization of uptime reliability over the last 24 hours.
- **Incidents Log**: A clean logs of recent system interruptions or errors.
- **Secure**: No sensitive controls or deep logs are exposed.

### 2. 🛡️ Admin Command Center (Authenticated)
The full-featured dashboard for system administrators.
- **Full Process Control**: Start, Stop, Restart, Delete, and Reset processes.
- **Deep Observability**: Interactive CPU/Memory charts and historic data.
- **Live Terminal**: Real-time log streaming and console output.
- **User Administration**: Manage access and permissions (Owner/Admin roles).
- **Settings**: Configure polling intervals, retention policies, and more.

### 3. 🧠 Smart Monitoring Agent
Includes a standalone `pm2-monitor-standalone.js` script that acts as a lightweight agent on your worker servers.
- **Low Overhead**: Minimal resource usage.
- **Auto-Discovery**: Automatically connects to the dashboard backend.
- **Resilient**: Buffers stats locally if connection drops.

---

## 🎨 Modern "Glassmorphism" Design
- **Theme**: Deep dark mode with indigo/violet accents (`bg-slate-950`).
- **Aesthetic**: Glassmorphism cards with subtle blurs and neon glows for status.
- **Mobile-First**: Fully responsive layout with sliding sidebars and touch-optimized controls.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, React, Mantine UI, Tailwind CSS.
- **Backend API**: tRPC, Node.js, Express.
- **Database**: MongoDB (Mongoose) for history and user data.
- **Real-time**: Socket.IO for live logs and status updates.

---

## 📦 Getting Started

### 1. Installation
Clone the repository and install dependencies using `turbo` or `npm`:
```bash
git clone https://github.com/thinhphan109/pm2-monitor.web.git
cd pm2-monitor.web
npm install
```

### 2. Configuration
Copy the example environment file and configure your MongoDB connection:
```bash
cp apps/dashboard/.env.example apps/dashboard/.env
# Edit .env and set MONGODB_URI, NEXTAUTH_SECRET, etc.
```

### 3. Running the Dashboard
Start the development server:
```bash
npm run dev
# Dashboard available at http://localhost:3000
```

### 4. Setting up a Worker Agent
To monitor a remote server, copy the standalone script to that server:
1. Copy `pm2-monitor-standalone.js` to the worker machine.
2. Install dependencies: `npm install socket.io-client systeminformation pm2`
3. Run the agent:
   ```bash
   node pm2-monitor-standalone.js
   ```

---

## 🔒 License
Released under the [GNU General Public License v3.0](LICENSE).
**Note**: This project is independent and not affiliated with Keymetrics/PM2.
