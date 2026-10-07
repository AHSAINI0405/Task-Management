import { z } from 'zod';
import User from '../models/User.model.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  hashPassword,
  comparePassword,
  hashToken,
  generateRawToken,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
} from '../services/token.service.js';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../services/email.service.js';

// ── Zod schemas ────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name:            z.string().min(2, 'Name must be at least 2 characters').max(100),
    email:           z.string().email('Please enter a valid email address'),
    password:        z.string().min(8, 'Password must be at least 8 characters').max(72),
    confirmPassword: z.string().optional(),
    timezone:        z.string().optional().default('UTC'),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(72),
});

// ── Controllers ───────────────────────────────────────────────────────

/** POST /auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, timezone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, timezone });

  const { accessToken, refreshToken } = setAuthCookies(res, user._id);

  // Store hashed refresh token
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  // Fire and forget
  sendWelcomeEmail(user).catch(console.error);

  res.status(201).json(
    new ApiResponse(201, { user: sanitiseUser(user), accessToken }, 'Account created successfully'),
  );
});

/** POST /auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials');

  const match = await comparePassword(password, user.passwordHash);
  if (!match) throw new ApiError(401, 'Invalid credentials');

  const { accessToken, refreshToken } = setAuthCookies(res, user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.json(new ApiResponse(200, { user: sanitiseUser(user), accessToken }, 'Logged in'));
});

/** POST /auth/logout */
export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+refreshTokenHash');
  if (user) {
    user.refreshTokenHash = null;
    await user.save();
  }
  clearAuthCookies(res);
  res.json(new ApiResponse(200, null, 'Logged out'));
});

/** POST /auth/refresh */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded._id).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    throw new ApiError(401, 'Refresh token revoked');
  }

  const { accessToken, refreshToken: newRefresh } = setAuthCookies(res, user._id);
  user.refreshTokenHash = hashToken(newRefresh);
  await user.save();

  res.json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

/** POST /auth/forgot-password */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+passwordResetToken');

  // Always respond 200 to avoid email enumeration
  if (!user) {
    return res.json(new ApiResponse(200, null, 'If that email exists you will receive a reset link'));
  }

  const rawToken = generateRawToken();
  user.passwordResetToken  = hashToken(rawToken);
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  await sendPasswordResetEmail(user, rawToken).catch(console.error);

  res.json(new ApiResponse(200, null, 'Password reset email sent'));
});

/** POST /auth/reset-password/:token */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    passwordResetToken:  hashedToken,
    passwordResetExpiry: { $gt: new Date() },
  }).select('+passwordResetToken');

  if (!user) throw new ApiError(400, 'Reset token is invalid or has expired');

  user.passwordHash        = await hashPassword(password);
  user.passwordResetToken  = null;
  user.passwordResetExpiry = null;
  user.refreshTokenHash    = null; // invalidate all sessions
  await user.save();

  clearAuthCookies(res);
  res.json(new ApiResponse(200, null, 'Password reset successful — please log in'));
});

/** GET /auth/me */
export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: sanitiseUser(req.user) }));
});

/** GET /auth/users - list registered users for task assignment */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true })
    .select('_id name email')
    .sort('name');
  res.json(new ApiResponse(200, { users }));
});

// ── Helpers ───────────────────────────────────────────────────────────

function sanitiseUser(user) {
  const { passwordHash, refreshTokenHash, passwordResetToken, ...safe } =
    user.toObject ? user.toObject() : user;
  return safe;
}
