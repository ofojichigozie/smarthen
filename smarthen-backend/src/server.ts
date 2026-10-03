import 'dotenv/config';
import http from 'http';
import app from './app';
import connectDB from './config/db';
import { initSocket } from './config/socket';

const PORT = process.env.PORT || 5000;

const start = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('✓ Database connected');

    const server = http.createServer(app);
    initSocket(server);
    console.log('✓ Socket.io initialized');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
