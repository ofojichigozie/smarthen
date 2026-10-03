# Smarthen Backend

REST API and real-time backend for **Smarthen**, a smart poultry management system. Built with Node.js, Express, TypeScript, MongoDB, and Socket.io.

It receives sensor data from an ESP32 controller, exposes a web dashboard, lets admins issue commands (fan, bulb, feed), and synchronizes system configuration.

---

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

---

## Setup

### 1. Install dependencies

```bash
cd smarthen-backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — a strong random secret for signing admin tokens
- `HARDWARE_API_KEY` — secret key shared with the ESP32 firmware
- `CORS_ORIGIN` — frontend URL (default `http://localhost:5173` for development)

### 3. Seed the database

```bash
npm run seed
```

This creates:
- **Admin account:** admin@smarthen.com / `admin123`
- **Default config:** temperature/humidity thresholds, gas threshold, auto modes, feeding times
- **Sample readings and commands** for development

### 4. Start the development server

```bash
npm run dev
```

The server runs on `http://localhost:5000` by default and initializes Socket.io for live dashboard updates.

### 5. Build for production

```bash
npm run build
npm start
```

---

## API Reference

### Auth

| Method | Endpoint         | Auth | Description        |
|--------|-----------------|------|--------------------|
| POST   | /api/auth/login | No   | Admin login        |

**Login body:**
```json
{
  "email": "admin@smarthen.com",
  "password": "admin123"
}
```

**Response:**
```json
{ "token": "<JWT>" }
```

---

### Hardware / ESP32 (requires `X-API-Key: <HARDWARE_API_KEY>`)

| Method | Endpoint                  | Description                                  |
|--------|---------------------------|----------------------------------------------|
| POST   | /api/readings/sensor-data | Submit sensor and actuator state             |
| GET    | /api/commands/pending     | Fetch pending commands for the device        |
| PUT    | /api/commands/execute     | Mark a command as executed or failed         |

**Sensor data body:**
```json
{
  "temperature": 28.5,
  "humidity": 62.0,
  "gasLevel": 145,
  "fanState": true,
  "bulbState": false,
  "buzzerState": false
}
```

**Execute command body:**
```json
{
  "commandId": "...",
  "status": "executed"
}
```

---

### Admin (requires `Authorization: Bearer <token>`)

#### Readings

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | /api/readings/latest      | Most recent sensor reading           |
| GET    | /api/readings/history     | Paginated reading history            |
| DELETE | /api/readings/:id         | Delete a reading by ID               |
| DELETE | /api/readings/            | Delete all readings                  |

#### Commands

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | /api/commands/        | Create a new command                 |
| GET    | /api/commands/history | Command history                      |
| DELETE | /api/commands/:id     | Delete a command by ID               |
| DELETE | /api/commands/        | Delete all commands                  |

**Create command body:**
```json
{
  "command": "fan_on"
}
```

Valid commands: `fan_on`, `fan_off`, `bulb_on`, `bulb_off`, `feed_dispense`.

**Command statuses:**

| Status      | Meaning                                                            |
|-------------|--------------------------------------------------------------------|
| `pending`   | Waiting to be fetched and executed by the hardware                 |
| `executed`  | Hardware reported successful execution                             |
| `failed`    | Hardware reported failure                                          |
| `cancelled` | Replaced by a newer command of the same type before execution      |
| `expired`   | Older than 1 hour and never executed                               |

When creating a command, any existing `pending` command of the same group (fan, bulb, feeder) is automatically marked as `cancelled`. When fetching pending commands, commands older than 1 hour are marked as `expired`, and only the latest pending command per group is returned to the hardware.

#### Config

| Method | Endpoint       | Auth                              | Description                          |
|--------|----------------|-----------------------------------|--------------------------------------|
| GET    | /api/config    | Admin JWT **or** hardware API key | Get current system configuration     |
| PUT    | /api/config    | Admin JWT                         | Update system configuration          |

**Config response:**
```json
{
  "temperatureMin": 18,
  "temperatureMax": 30,
  "humidityMin": 40,
  "humidityMax": 70,
  "gasThreshold": 200,
  "fanAutoMode": true,
  "bulbAutoMode": true,
  "buzzerEnabled": true,
  "feedingTimes": ["02:00", "06:00", "09:00", "15:00"],
  "deviceOnline": true,
  "deviceLastSeen": "2026-08-28T12:00:00.000Z"
}
```

---

## Real-time updates

The server emits Socket.io events on connection. The frontend uses these to refresh the dashboard without polling. See [`smarthen-frontend`](../smarthen-frontend) for the dashboard implementation.

---

## Project Structure

```
src/
├── config/         # Database and Socket.io configuration
├── controllers/    # Route handler functions
├── middleware/     # Auth, error, validation middleware
├── models/         # Mongoose schemas
├── routes/         # Express routers
├── services/       # Business logic
├── utils/          # Response helpers
├── validations/    # Zod schemas
├── seeders/        # Database seed scripts
├── app.ts          # Express app setup
└── server.ts       # Entry point
```
