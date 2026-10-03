import { z } from 'zod';

export const updateConfigSchema = z.object({
  temperatureMin: z.number().min(-10).max(60).optional(),
  temperatureMax: z.number().min(-10).max(60).optional(),
  humidityMin: z.number().min(0).max(100).optional(),
  humidityMax: z.number().min(0).max(100).optional(),
  gasThreshold: z.number().min(0).optional(),
  fanAutoMode: z.boolean().optional(),
  bulbAutoMode: z.boolean().optional(),
  buzzerEnabled: z.boolean().optional(),
  feedingTimes: z
    .array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'))
    .optional(),
});

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
