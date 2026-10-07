import express        from 'express';
import helmet         from 'helmet';
import cors           from 'cors';
import cookieParser   from 'cookie-parser';
import { env }        from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// ── Routes ─────────────────────────────────────────────────────────────
import authRoutes      from './routes/auth.routes.js';
import profileRoutes   from './routes/profile.routes.js';
import taskRoutes      from './routes/tasks.routes.js';
import jobRoutes       from './routes/jobs.routes.js';
import eventRoutes     from './routes/events.routes.js';
import reminderRoutes  from './routes/reminders.routes.js';
import { dashRouter, calRouter } from './routes/misc.routes.js';

const app = express();

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');

// ── Security headers ───────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// ── Serve uploaded attachments ─────────────────────────────────────────
app.use('/uploads', express.static(uploadDir));

// ── CORS ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:      env.CLIENT_URL,
    credentials: true,               // allow cookies cross-origin
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ── Body / cookie parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// ── General rate limit ─────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ───────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

// ── API routes ─────────────────────────────────────────────────────────
const v1 = '/api/v1';
app.use(`${v1}/auth`,       authRoutes);
app.use(`${v1}/profile`,    profileRoutes);
app.use(`${v1}/tasks`,      taskRoutes);
app.use(`${v1}/jobs`,       jobRoutes);
app.use(`${v1}/events`,     eventRoutes);
app.use(`${v1}/reminders`,  reminderRoutes);
app.use(`${v1}/dashboard`,  dashRouter);
app.use(`${v1}/calendar`,   calRouter);

// ── 404 ────────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' }),
);

// ── Global error handler (must be last) ───────────────────────────────
app.use(errorHandler);

export default app;
