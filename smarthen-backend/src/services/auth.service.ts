import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model';
import { AppError } from '../middleware/error.middleware';

export const loginAdmin = async (email: string, password: string) => {
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign({ adminId: admin._id.toString() }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });

  return {
    admin: { id: admin._id, name: admin.name, email: admin.email },
    token,
  };
};
