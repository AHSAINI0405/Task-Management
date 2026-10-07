import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env.js';

/** Sign a short-lived access token */
export function signAccessToken(userId) {
  return jwt.sign({ _id: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

/** Sign a long-lived refresh token */
export function signRefreshToken(userId) {
  return jwt.sign({ _id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

/** Verify a refresh token — returns payload or throws */
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/** Hash a token (refresh / reset) before storing in DB */
export function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/** Generate a secure random hex token */
export function generateRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/** Cookie options for access token */
export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure:   env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge:   15 * 60 * 1000, // 15 minutes
  };
}

/** Cookie options for refresh token */
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure:   env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

/** Helper: set both auth cookies on a response */
export function setAuthCookies(res, userId) {
  const accessToken  = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  res.cookie('accessToken',  accessToken,  accessCookieOptions());
  res.cookie('refreshToken', refreshToken, refreshCookieOptions());
  return { accessToken, refreshToken };
}

/** Helper: clear both auth cookies */
export function clearAuthCookies(res) {
  res.clearCookie('accessToken',  { httpOnly: true, secure: env.NODE_ENV === 'production' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: env.NODE_ENV === 'production' });
}

/** Hash a password */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

/** Compare a plain password with a hash */
export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
