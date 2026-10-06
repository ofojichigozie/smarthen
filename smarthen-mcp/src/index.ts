import { McpServer } from '@modelcontextprotocol/server';
import { config } from './config.js';
import { registerReadingTools } from './tools/readings.tools.js';
import { registerConfigTools } from './tools/config.tools.js';
import { registerCommandTools } from './tools/commands.tools.js';
import { startStdioTransport } from './transports/stdio.transport.js';
import { startHttpTransport } from './transports/http.transport.js';

const createServer = (): McpServer => {
  const server = new McpServer({
    name: 'smarthen-mcp',
    version: '1.0.0',
  });

  // Health check
  server.registerTool(
    'ping',
    {
      description: 'Health check — returns a static pong response with the API URL in use.',
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            pong: true,
            apiUrl: config.apiUrl,
            transport: config.transport,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    }),
  );

  registerReadingTools(server);
  registerConfigTools(server);
  registerCommandTools(server);

  return server;
};

console.error(`[smarthen-mcp] Starting (transport=${config.transport}, api=${config.apiUrl})`);

if (config.transport === 'http') {
  startHttpTransport(createServer);
} else {
  startStdioTransport(createServer);
}
