import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.routes';
import configRoutes from './routes/config.routes';
import readingRoutes from './routes/reading.routes';
import commandRoutes from './routes/command.routes';

// Middleware
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

// ── Security Headers ──
app.use(helmet());

// ── CORS ──
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 250, // Limit each IP to 250 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later.', data: null },
});
app.use(limiter);

// ── Request Logging ──
app.use(morgan('dev'));

// ── Body Parsing ──
app.use(express.json());

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/commands', commandRoutes);

// ── 404 & Error Handlers ──
app.use(notFound);
app.use(errorHandler);

export default app;
