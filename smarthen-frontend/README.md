# Smarthen Frontend

React + TypeScript dashboard for **Smarthen**, a smart poultry management system. Built with Vite, Tailwind CSS, Recharts, and Socket.io-client.

It connects to the [`smarthen-backend`](../smarthen-backend) to display live sensor data, control actuators, view reading history, and manage system configuration.

---

## Features

- **Login** — JWT-based admin authentication
- **Dashboard** — Live temperature, humidity, and gas readings with charts
- **Controls** — Send commands to the ESP32: fan on/off, bulb on/off, dispense feed
- **Readings** — Paginated history of sensor readings
- **Settings** — Update thresholds, auto modes, buzzer setting, and feeding schedule

---

## Prerequisites

- Node.js >= 18
- The [`smarthen-backend`](../smarthen-backend) server running

---

## Setup

### 1. Install dependencies

```bash
cd smarthen-frontend
npm install
```

### 2. Configure the API URL (optional)

By default, the frontend proxies `/api` requests to `http://localhost:3000` during development (see [`vite.config.ts`](vite.config.ts)).

If your backend runs on a different port or you are building for production, create a `.env` file:

```bash
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the development server

```bash
npm run dev
```

The app runs on `http://localhost:5173` by default.

### 4. Build for production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Default login

Use the admin account created by the backend seeder:

- **Email:** admin@smarthen.com
- **Password:** admin123

---

## Project Structure

```
src/
├── components/        # Reusable UI and layout components
│   ├── layout/        # DashboardLayout, Sidebar
│   ├── ui/            # Button, Card, Input, etc.
│   └── ProtectedRoute.tsx
├── hooks/             # Data-fetching hooks (useAuth, useReadings, etc.)
├── pages/             # DashboardPage, ReadingsPage, ControlsPage, SettingsPage, LoginPage
├── services/          # API and socket clients
├── types/             # TypeScript model and request/response types
├── utils/             # Error handling and notification helpers
├── App.tsx            # Router setup
├── main.tsx           # Entry point
└── index.css          # Tailwind styles
```
