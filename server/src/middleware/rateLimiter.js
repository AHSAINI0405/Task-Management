import rateLimit from 'express-rate-limit';

const json429 = (_req, res) =>
  res.status(429).json({
    success: false,
    message: 'Too many requests — please try again later.',
  });

/** Strict limiter for auth endpoints (login, register, forgot-password) */
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              20,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          json429,
});

/** General API limiter for all other routes */
export const apiLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              300,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          json429,
});
