import { McpServer, inputRequired, acceptedContent } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { apiClient } from '../lib/api-client.js';
import { Config } from '../types.js';
import { toolSuccess, toolError } from '../lib/tool-result.js';

const confirmationSchema = z.object({
  confirm: z.boolean().meta({ title: 'Confirm' }),
});

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

  server.registerTool(
    'update_config',
    {
      description:
        'Update the farm configuration. The admin will be asked to confirm the ' +
        'proposed changes before they are saved. Use this when the user asks to ' +
        'change thresholds, toggle automation modes, or modify the feeding schedule.',
      inputSchema: z.object({
        temperatureMin: z
          .number()
          .min(-10)
          .max(60)
          .optional()
          .describe('Minimum temperature threshold in °C'),
        temperatureMax: z
          .number()
          .min(-10)
          .max(60)
          .optional()
          .describe('Maximum temperature threshold in °C'),
        humidityMin: z
          .number()
          .min(0)
          .max(100)
          .optional()
          .describe('Minimum humidity threshold in %'),
        humidityMax: z
          .number()
          .min(0)
          .max(100)
          .optional()
          .describe('Maximum humidity threshold in %'),
        gasThreshold: z
          .number()
          .min(0)
          .optional()
          .describe('Gas level above which the buzzer sounds'),
        fanAutoMode: z.boolean().optional().describe('Enable automatic fan control'),
        bulbAutoMode: z.boolean().optional().describe('Enable automatic bulb control'),
        buzzerEnabled: z.boolean().optional().describe('Enable or disable the buzzer'),
        feedingTimes: z
          .array(z.string())
          .optional()
          .describe('Daily feeding times in HH:MM format, e.g. ["06:00", "18:00"]'),
      }),
    },
    async (args, ctx) => {
      const entries = Object.entries(args).filter(([, v]) => v !== undefined);

      if (entries.length === 0) {
        return {
          content: [{ type: 'text' as const, text: 'No changes were provided.' }],
          isError: true,
        };
      }

      // --- Pass 1: no answer yet, ask for confirmation --------------------
      if (!ctx.mcpReq.inputResponses?.confirm) {
        const summary = entries
          .map(([key, value]) => `  • ${key} → ${JSON.stringify(value)}`)
          .join('\n');

        return inputRequired({
          inputRequests: {
            confirm: inputRequired.elicit({
              message: `The assistant wants to update the farm configuration:\n\n${summary}\n\nConfirm?`,
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
              text: 'Update declined. No changes were saved.',
            },
          ],
        };
      }

      try {
        const response = await apiClient.put<Config>('/config', args);
        return toolSuccess(response.data);
      } catch (error) {
        return toolError(error);
      }
    },
  );
};
