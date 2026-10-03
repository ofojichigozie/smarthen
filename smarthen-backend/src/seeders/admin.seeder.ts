import 'dotenv/config';
import bcrypt from 'bcryptjs';
import Admin from '../models/admin.model';

const ADMIN_NAME = 'Smarthen Admin';
const ADMIN_EMAIL = 'admin@smarthen.dev';
const ADMIN_PASSWORD = 'Admin@Smarthen123';

export const seedAdmin = async (): Promise<void> => {
  const existing = await Admin.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists — skipping.');
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await Admin.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashedPassword });
  console.log(`Admin seeded: ${ADMIN_EMAIL}`);
};
