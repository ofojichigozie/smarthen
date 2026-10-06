import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { config } from './config.js';
import { registerReadingTools } from './tools/readings.tools.js';
import { registerConfigTools } from './tools/config.tools.js';
import { registerCommandTools } from './tools/commands.tools.js';

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
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    }),
  );

  // Domain tools
  registerReadingTools(server);
  registerConfigTools(server);
  registerCommandTools(server);

  return server;
};

void serveStdio(createServer);
console.error(`[smarthen-mcp] Server running on stdio (api: ${config.apiUrl})`);
