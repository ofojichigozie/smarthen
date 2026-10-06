import 'dotenv/config';

type TransportMode = 'stdio' | 'http';

interface Config {
  transport: TransportMode;
  port: number;
  backendUrl: string;
  serviceApiKey: string;
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
  transport: parseTransport(process.env.MCP_TRANSPORT ?? 'stdio'),
  port: Number(process.env.MCP_PORT ?? 3001),
  backendUrl: required('BACKEND_URL').replace(/\/$/, ''), // strip trailing slash
  serviceApiKey: required('SERVICE_API_KEY'),
};