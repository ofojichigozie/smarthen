import 'dotenv/config';
import Command from '../models/command.model';

import { COMMANDS } from '../models/command.model';

const STATUSES = ['pending', 'executed', 'failed', 'cancelled', 'expired'] as const;
const SOURCES = ['manual', 'auto'] as const;

const randomItem = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomTimestamp = (index: number, total: number): Date => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const range = now.getTime() - sevenDaysAgo.getTime();
  const base = sevenDaysAgo.getTime() + (index / total) * range;
  const jitter = (Math.random() - 0.5) * 30 * 60 * 1000; // ±30 min
  return new Date(base + jitter);
};

export const seedCommands = async (count: number = 50): Promise<void> => {
  const existing = await Command.countDocuments();
  if (existing > 0) {
    console.log(`Commands already exist (${existing}) — skipping.`);
    return;
  }

  const commands = [];
  for (let i = 0; i < count; i++) {
    const issuedAt = randomTimestamp(i, count);
    const status = randomItem(STATUSES);
    const executedAt =
      status === 'pending' || status === 'cancelled' || status === 'expired'
        ? null
        : new Date(issuedAt.getTime() + Math.random() * 10 * 60 * 1000);
    commands.push({
      command: randomItem(COMMANDS),
      issuedAt,
      executedAt,
      status,
      source: randomItem(SOURCES),
    });
  }

  await Command.insertMany(commands);
  console.log(`✅ ${count} random commands seeded.`);
};
