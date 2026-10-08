import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { apiClient } from '../lib/api-client.js';
import { Command, PaginatedData } from '../types.js';
import { toolSuccess, toolError } from '../lib/tool-result.js';

export const registerCommandTools = (server: McpServer): void => {
  server.registerTool(
    'get_command_history',
    {
      description:
        'Get the history of control commands sent to the farm. Returns a paginated ' +
        'list of commands (fan_on, fan_off, bulb_on, bulb_off, feed_dispense) with ' +
        'their source (manual/auto), status (pending/executed/failed), and timestamps. ' +
        'Use this to see what actions have been taken and when.',
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe('Max commands per page (default 20, max 100)'),
        skip: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe('Number of commands to skip, for pagination'),
      }),
    },
    async ({ limit, skip }) => {
      console.error('[Tool] get_command_history', { limit, skip });

      try {
        const response = await apiClient.get<PaginatedData<Command>>('/commands/history', {
          limit,
          skip,
        });
        return toolSuccess(response.data);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'send_command',
    {
      description:
        'Send a control command to the poultry farm. Use this when the user ' +
        'explicitly asks to turn something on/off or dispense feed. The command ' +
        'will be submitted for admin approval before being executed.',
      inputSchema: z.object({
        command: z
          .enum(['fan_on', 'fan_off', 'bulb_on', 'bulb_off', 'feed_dispense'])
          .describe('The control command to send to the farm'),
      }),
    },
    async ({ command }) => {
      console.error('[Tool] send_command', { command });

      try {
        const response = await apiClient.post<Command>('/commands', { command });
        return toolSuccess(response.data);
      } catch (error) {
        return toolError(error);
      }
    },
  );
};
