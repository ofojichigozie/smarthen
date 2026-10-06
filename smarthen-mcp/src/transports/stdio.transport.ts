import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

export const startStdioTransport = (createServer: () => McpServer): void => {
  void serveStdio(createServer);
  console.error('[smarthen-mcp] Running on stdio transport');
};
