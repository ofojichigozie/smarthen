import { z } from 'zod';

export const sensorDataSchema = z.object({
  temperature: z.number().min(-40).max(80),
  humidity: z.number().min(0).max(100),
  gasLevel: z.number().min(0),
  fanState: z.boolean(),
  bulbState: z.boolean(),
  buzzerState: z.boolean(),
});

export type SensorDataInput = z.infer<typeof sensorDataSchema>;
