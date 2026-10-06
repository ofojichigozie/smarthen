import { createServer } from 'node:http';
import { McpServer, createMcpHandler } from '@modelcontextprotocol/server';
import {
  toNodeHandler,
  localhostHostValidation,
  localhostOriginValidation,
} from '@modelcontextprotocol/node';
import { config } from '../config.js';

export const startHttpTransport = (createServerFn: () => McpServer): void => {
  const handler = createMcpHandler(createServerFn);
  const nodeHandler = toNodeHandler(handler);
  const validateHost = localhostHostValidation();
  const validateOrigin = localhostOriginValidation();

  const httpServer = createServer((req, res) => {
    // DNS rebinding guards — return 403 if the request looks malicious
    if (!validateHost(req, res) || !validateOrigin(req, res)) return;

    // CORS for browser-based clients (Inspector, future chat UI)
    res.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version',
    );
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    void nodeHandler(req, res);
  });

  httpServer.listen(config.port, () => {
    console.error(
      `[smarthen-mcp] Running on Streamable HTTP at http://localhost:${config.port}/mcp`,
    );
  });

  const shutdown = () => {
    httpServer.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};
