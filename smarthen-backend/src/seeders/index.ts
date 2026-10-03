import 'dotenv/config';
import mongoose from 'mongoose';
import { seedAdmin } from './admin.seeder';
import { seedConfig } from './config.seeder';
import { seedReadings } from './reading.seeder';
import { seedCommands } from './command.seeder';

const run = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✓ Connected to MongoDB\n');

    console.log('🌱 Seeding admin...');
    await seedAdmin();

    console.log('🌱 Seeding default configuration...');
    await seedConfig();

    console.log('🌱 Seeding sample readings...');
    await seedReadings(100); // generate 100 readings

    console.log('🌱 Seeding sample commands...');
    await seedCommands(50);

    console.log('\n✅ Seeding complete!');
  } catch (err) {
    console.error('❌ Seeder error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

run();
