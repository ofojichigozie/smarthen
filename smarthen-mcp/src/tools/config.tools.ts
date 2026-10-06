import { McpServer } from '@modelcontextprotocol/server';
import { apiClient } from '../lib/api-client.js';
import { Config } from '../types.js';
import { toolSuccess, toolError } from '../lib/tool-result.js';

export const registerConfigTools = (server: McpServer): void => {
  server.registerTool(
    'get_config',
    {
      description:
        'Get the current farm configuration. Returns temperature and humidity ' +
        'thresholds, gas threshold, automation modes (fan, bulb, buzzer), ' +
        'and the daily feeding schedule. Use this to understand the current ' +
        'settings before suggesting or making changes.',
    },
    async () => {
      try {
        const response = await apiClient.get<Config>('/config');
        return toolSuccess(response.data);
      } catch (error) {
        return toolError(error);
      }
    },
  );
};
