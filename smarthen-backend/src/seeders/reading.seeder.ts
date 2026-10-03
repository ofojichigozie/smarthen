import 'dotenv/config';
import Reading from '../models/reading.model';

const randomNumber = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
};

const randomBool = (): boolean => Math.random() < 0.5;

const randomTimestamp = (index: number, total: number): Date => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const range = now.getTime() - sevenDaysAgo.getTime();
  // Distribute evenly but add some randomness
  const base = sevenDaysAgo.getTime() + (index / total) * range;
  const jitter = (Math.random() - 0.5) * 30 * 60 * 1000; // ±30 min
  return new Date(base + jitter);
};

export const seedReadings = async (count: number = 100): Promise<void> => {
  const existing = await Reading.countDocuments();
  if (existing > 0) {
    console.log(`Readings already exist (${existing}) — skipping.`);
    return;
  }

  const readings = [];
  for (let i = 0; i < count; i++) {
    readings.push({
      timestamp: randomTimestamp(i, count),
      temperature: randomNumber(18, 35),
      humidity: randomNumber(30, 80),
      gasLevel: randomNumber(50, 600),
      fanState: randomBool(),
      bulbState: randomBool(),
      buzzerState: randomBool(),
    });
  }

  await Reading.insertMany(readings);
  console.log(`✅ ${count} random readings seeded.`);
};
