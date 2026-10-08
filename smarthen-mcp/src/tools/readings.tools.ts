import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { apiClient } from '../lib/api-client.js';
import { Reading, PaginatedData } from '../types.js';
import { toolSuccess, toolError } from '../lib/tool-result.js';

export const registerReadingTools = (server: McpServer): void => {
  server.registerTool(
    'get_latest_reading',
    {
      description:
        'Get the most recent sensor reading from the poultry farm. ' +
        'Returns current temperature (°C), humidity (%), gas level, ' +
        'and the current state (on/off) of the fan, bulb, and buzzer. ' +
        'Use this when the user asks about current conditions.',
    },
    async () => {
      console.error('[Tool] get_latest_reading');

      try {
        const response = await apiClient.get<Reading>('/readings/latest');
        return toolSuccess(response.data);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'get_readings_history',
    {
      description:
        'Get historical sensor readings from the poultry farm, paginated. ' +
        'Returns a list of readings with timestamps, sensor values, and actuator states. ' +
        'Optionally filter by date range. Use this for trend analysis or to answer ' +
        'questions about past conditions.',
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe('Max readings per page (default 20, max 100)'),
        skip: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe('Number of readings to skip, for pagination'),
        from: z.string().optional().describe('ISO 8601 start date, e.g. 2026-10-01T00:00:00Z'),
        to: z.string().optional().describe('ISO 8601 end date, e.g. 2026-10-06T23:59:59Z'),
      }),
    },
    async ({ limit, skip, from, to }) => {
      console.error('[Tool] get_readings_history', { limit, skip, from, to });

      try {
        const response = await apiClient.get<PaginatedData<Reading>>('/readings/history', {
          limit,
          skip,
          from,
          to,
        });
        return toolSuccess(response.data);
      } catch (error) {
        return toolError(error);
      }
    },
  );
};
