import 'dotenv/config';
import Config from '../models/config.model';

export const seedConfig = async (): Promise<void> => {
  const existing = await Config.findOne();
  if (existing) {
    console.log('Config already exists — skipping.');
    return;
  }

  // Create with defaults (all fields already have default values in the schema)
  await Config.create({});
  console.log('Default configuration seeded.');
};
