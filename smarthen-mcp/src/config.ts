import 'dotenv/config';

type TransportMode = 'stdio' | 'http';

interface Config {
  transport: TransportMode;
  port: number;
  apiUrl: string;
  mcpServiceApiKey: string;
  mcpClientApiKey: string;
  corsOrigin: string;
}

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const parseTransport = (value: string): TransportMode => {
  if (value !== 'stdio' && value !== 'http') {
    throw new Error(`MCP_TRANSPORT must be "stdio" or "http", got "${value}"`);
  }
  return value;
};

export const config: Config = {
  transport: parseTransport(process.env.MCP_TRANSPORT ?? 'http'),
  port: Number(process.env.MCP_PORT ?? 3001),
  apiUrl: required('API_URL').replace(/\/$/, ''),
  mcpServiceApiKey: required('MCP_SERVICE_API_KEY'),
  mcpClientApiKey: process.env.MCP_CLIENT_API_KEY ?? '',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};
