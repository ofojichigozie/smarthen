import { z } from 'zod';

export const createCommandSchema = z.object({
  command: z.enum(['fan_on', 'fan_off', 'bulb_on', 'bulb_off', 'feed_dispense']),
});

export const executeCommandSchema = z.object({
  commandId: z.string().min(1, 'Command ID is required'),
  status: z.enum(['executed', 'failed']),
});

export type CreateCommandInput = z.infer<typeof createCommandSchema>;
export type ExecuteCommandInput = z.infer<typeof executeCommandSchema>;
