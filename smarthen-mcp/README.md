# Smarthen MCP

Model Context Protocol (MCP) server for **Smarthen**, a smart poultry management system. It connects MCP clients to the [`smarthen-backend`](../smarthen-backend) to read sensor data and configuration, review command history, and submit farm control or configuration changes.

---

## Available tools

| Tool | Description |
|------|-------------|
| `ping` | Return server status, configured API URL, transport, and timestamp. This does not verify backend connectivity. |
| `get_latest_reading` | Get current temperature, humidity, gas level, and fan, bulb, and buzzer states. |
| `get_readings_history` | Get paginated sensor history; optionally filter with ISO 8601 `from` and `to` dates. `limit` defaults to 20 and is capped at 100; use `skip` for pagination. |
| `get_config` | Read temperature and humidity thresholds, gas threshold, automation modes, and feeding schedule. |
| `update_config` | Update one or more configuration values, such as thresholds, automation modes, or feeding times. |
| `get_command_history` | Get paginated command history. `limit` defaults to 20 and is capped at 100; use `skip` for pagination. |
| `send_command` | Submit one of `fan_on`, `fan_off`, `bulb_on`, `bulb_off`, or `feed_dispense`. |

### Write actions

`update_config` and `send_command` make authenticated write requests to the backend. The backend applies configuration updates immediately and queues commands for the hardware; these service-key requests do not require a separate admin approval step. Only invoke write tools when the user explicitly asks for the change, and use an MCP client that lets users review or confirm write actions.

---

## Prerequisites

- Node.js >= 20
- The [`smarthen-backend`](../smarthen-backend) server running
- A backend `.env` configured with `MCP_SERVICE_API_KEY`

The MCP server and backend must use the same `MCP_SERVICE_API_KEY`.

---

## Setup

### 1. Install dependencies

```bash
cd smarthen-mcp
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set `API_URL` to the backend API base URL, including `/api` (default `http://localhost:5000/api`), and `MCP_SERVICE_API_KEY` to a secret shared with the backend's `.env`.

The server defaults to Streamable HTTP transport (`MCP_TRANSPORT=http`). `MCP_PORT` sets the HTTP port (default `3001`), `CORS_ORIGIN` sets the allowed browser origin (default `*`), and `MCP_CLIENT_API_KEY` optionally requires HTTP clients to send `Authorization: Bearer <key>`. When connecting from the backend's AI service, configure the same `MCP_CLIENT_API_KEY` in both `.env` files.

### 3. Start the server

For local development with automatic restart:

```bash
npm run dev
```

To build and run the compiled server:

```bash
npm run build
npm start
```

With the default HTTP transport, the server listens on port `3001` by default at `http://localhost:3001/mcp`. If `MCP_CLIENT_API_KEY` is configured, MCP clients must send it as a bearer token.

To use stdio instead, set `MCP_TRANSPORT=stdio` in `.env` before starting. Configure your MCP client to launch `node dist/index.js` from the `smarthen-mcp` directory and provide the required environment variables. The server writes diagnostic logs to stderr so its stdout remains available for the MCP protocol.

### 4. Inspect the server (optional)

The Inspector scripts launch the server over stdio. Set `MCP_TRANSPORT=stdio` in `.env` before using them:

```bash
npm run build
npm run inspect
```

For inspection directly from TypeScript during development:

```bash
npm run inspect:dev
```

---

## Project structure

```
src/
├── lib/              # Backend API client and MCP tool result helpers
├── tools/            # Reading, configuration, and command tools
├── transports/       # Stdio and Streamable HTTP transports
├── config.ts         # Environment configuration
├── index.ts          # MCP server setup and tool registration
└── types.ts          # Backend response types
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run the server from TypeScript with watch mode |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled server |
| `npm run inspect` | Inspect the compiled server with MCP Inspector |
| `npm run inspect:dev` | Inspect the TypeScript server with MCP Inspector |
| `npm run format` | Format TypeScript source files |
| `npm run format:check` | Check TypeScript source formatting |

---

See the [`smarthen-backend` README](../smarthen-backend/README.md) for backend setup, API details, and hardware integration.
