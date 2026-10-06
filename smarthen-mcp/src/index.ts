import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { config } from './config.js';

const createServer = (): McpServer => {
  const server = new McpServer({
    name: 'smarthen-mcp',
    version: '1.0.0',
  });

  server.registerTool(
    'ping',
    {
      description: 'Health check — returns a static pong response with the backend URL in use.',
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            pong: true,
            apiUrl: config.apiUrl,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    }),
  );

  return server;
};

void serveStdio(createServer);
console.error(`[smarthen-mcp] Server running on stdio (backend: ${config.apiUrl})`);