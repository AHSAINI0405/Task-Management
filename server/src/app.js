import express        from 'express';
import helmet         from 'helmet';
import cors           from 'cors';
import cookieParser   from 'cookie-parser';
import { env }        from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// ── Routes ─────────────────────────────────────────────────────────────
import authRoutes    from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import taskRoutes    from './routes/tasks.routes.js';
import dashRouter    from './routes/misc.routes.js';

const app = express();

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const uploadDir  = path.resolve(__dirname, '../uploads');

// ── Trust proxy (required for secure cookies behind load balancers) ────
app.set('trust proxy', 1);

// ── Security headers ───────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// ── Serve uploaded attachments ─────────────────────────────────────────
app.use('/uploads', express.static(uploadDir));

// ── CORS ───────────────────────────────────────────────────────────────
const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const clean = origin.trim().replace(/\/$/, '');

  // Check against CLIENT_URL (supports comma-separated origins)
  const configuredList = (env.CLIENT_URL || '')
    .split(',')
    .map((u) => u.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (configuredList.includes(clean)) return true;

  // Allow any Vercel deployment
  if (
    clean === 'https://task-management-alpha-tan.vercel.app' ||
    clean.endsWith('.vercel.app')
  ) {
    return true;
  }

  // Local development
  if (
    clean.startsWith('http://localhost:') ||
    clean.startsWith('http://127.0.0.1:') ||
    clean === 'http://localhost'
  ) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
app.use(`${v1}/auth`,      authRoutes);
app.use(`${v1}/profile`,   profileRoutes);
app.use(`${v1}/tasks`,     taskRoutes);
app.use(`${v1}/dashboard`, dashRouter);

// ── 404 ────────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' }),
);

// ── Global error handler (must be last) ───────────────────────────────
app.use(errorHandler);

export default app;
