# Smarthen

Smarthen is a smart poultry management system that combines an ESP32-based controller, a backend API, a web dashboard, and an MCP server for AI-assisted access to farm data and controls.

## Components

| Project | Purpose | Documentation |
|---------|---------|---------------|
| [`smarthen-frontend`](./smarthen-frontend/) | React dashboard for live sensor readings, history, farm controls, and configuration. | [README](./smarthen-frontend/README.md) |
| [`smarthen-backend`](./smarthen-backend/) | Node.js API and real-time service that stores farm data, manages commands and configuration, and provides the AI chat endpoint. | [README](./smarthen-backend/README.md) |
| [`smarthen-firmware`](./smarthen-firmware/) | ESP32 firmware for sensing environmental conditions and controlling the fan, bulb, buzzer, and feeder. | [README](./smarthen-firmware/README.md) |
| [`smarthen-mcp`](./smarthen-mcp/) | MCP server that exposes sensor readings, configuration, command history, and write actions as tools. | [README](./smarthen-mcp/README.md) |

## How the system fits together

- The ESP32 firmware sends sensor and actuator readings to the backend and retrieves configuration and pending commands over Wi-Fi.
- The frontend uses the backend API and Socket.io updates to show current farm conditions and let an admin manage the system.
- The MCP server connects to the backend and provides tools for MCP clients. The backend's AI chat service can also connect to the MCP server over Streamable HTTP.
- The backend stores readings, commands, and configuration in MongoDB.

The MCP server uses Streamable HTTP by default and listens on port `3001` unless configured otherwise. Its MCP endpoint is `/mcp`.

## Repository layout

```
smarthen/
├── smarthen-backend/
├── smarthen-firmware/
├── smarthen-frontend/
└── smarthen-mcp/
```

Each component has its own dependencies, configuration, and setup instructions. Refer to its README linked above for prerequisites, environment variables, development commands, and deployment guidance.
