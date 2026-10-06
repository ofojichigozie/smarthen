import { McpServer, inputRequired, acceptedContent } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { apiClient } from '../lib/api-client.js';
import { Command, PaginatedData } from '../types.js';
import { toolSuccess, toolError } from '../lib/tool-result.js';

const confirmationSchema = z.object({
  confirm: z.boolean().meta({ title: 'Confirm' }),
});

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
        'Send a control command to the poultry farm. The admin will be asked to ' +
        'confirm before the command is executed. Use this when the user explicitly ' +
        'asks to turn something on/off or dispense feed.',
      inputSchema: z.object({
        command: z
          .enum(['fan_on', 'fan_off', 'bulb_on', 'bulb_off', 'feed_dispense'])
          .describe('The control command to send to the farm'),
      }),
    },
    async ({ command }, ctx) => {
      // --- Pass 1: no answer yet, ask for confirmation --------------------
      if (!ctx.mcpReq.inputResponses?.confirm) {
        return inputRequired({
          inputRequests: {
            confirm: inputRequired.elicit({
              message: `The assistant wants to send the command "${command}" to the farm. Confirm?`,
              requestedSchema: confirmationSchema,
            }),
          },
        });
      }

      // --- Pass 2: user answered — check whether it was an acceptance ----
      const confirmed = acceptedContent(ctx.mcpReq.inputResponses, 'confirm', confirmationSchema);

      if (confirmed?.confirm !== true) {
        return {
          content: [
            {
              type: 'text' as const,
              text: 'Command declined. No action was taken.',
            },
          ],
        };
      }

      try {
        const response = await apiClient.post<Command>('/commands', { command });
        return toolSuccess(response.data);
      } catch (error) {
        return toolError(error);
      }
    },
  );
};
