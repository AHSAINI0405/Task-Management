import { z } from 'zod';
import User from '../models/User.model.js';
import Otp from '../models/Otp.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createCaptchaChallenge, verifyCaptchaAnswer } from '../utils/captcha.js';
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
  sendOtpEmail,
} from '../services/email.service.js';

// ── Zod Schemas ────────────────────────────────────────────────────────

export const sendRegisterOtpSchema = z.object({
  name:          z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email:         z.string().email('Please enter a valid email address'),
  captchaToken:  z.string().min(1, 'Captcha token is required'),
  captchaAnswer: z.string().min(1, 'Captcha answer is required'),
});

export const registerSchema = z.object({
  name:     z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email:    z.string().email('Please enter a valid email address'),
  otp:      z.string().length(6, 'Verification code must be 6 digits'),
  timezone: z.string().optional().default('UTC'),
});

export const sendLoginOtpSchema = z.object({
  email:         z.string().email('Please enter a valid email address'),
  captchaToken:  z.string().min(1, 'Captcha token is required'),
  captchaAnswer: z.string().min(1, 'Captcha answer is required'),
});

export const loginOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp:   z.string().length(6, 'Login code must be 6 digits'),
});

export const legacyLoginSchema = z.object({
  email:         z.string().email(),
  password:      z.string().min(1),
  captchaToken:  z.string().min(1, 'Captcha token is required'),
  captchaAnswer: z.string().min(1, 'Captcha answer is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(72),
});

// ── Controllers ───────────────────────────────────────────────────────

/**
 * GET /auth/captcha
 * Generates an SVG visual captcha image and an HMAC-SHA256 signed captcha token.
 */
export const getCaptcha = asyncHandler(async (_req, res) => {
  const challenge = createCaptchaChallenge();
  res.json(new ApiResponse(200, challenge, 'Captcha generated'));
});

/**
 * POST /auth/send-register-otp
 * Verifies captcha, ensures email not already used, generates & emails 6-digit OTP.
 */
export const sendRegisterOtp = asyncHandler(async (req, res) => {
  const { name, email, captchaToken, captchaAnswer } = req.body;

  // Verify captcha challenge (prevents bots / API testers)
  verifyCaptchaAnswer(captchaToken, captchaAnswer);

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Email is already registered. Please log in.');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = hashToken(otp);

  // Store OTP with 10-minute expiration
  await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'register' });
  await Otp.create({
    email: email.toLowerCase(),
    otpHash,
    purpose: 'register',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // Send via EmailJS
  await sendOtpEmail(email, name, otp, 'register');

  res.json(new ApiResponse(200, null, 'Verification code sent to your email.'));
});

/**
 * POST /auth/register
 * Verifies OTP and registers account.
 * IMPORTANT: Does NOT issue login cookies so user must log in from login page.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, otp, timezone } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    throw new ApiError(409, 'Email is already registered. Please log in.');
  }

  const record = await Otp.findOne({ email: cleanEmail, purpose: 'register' }).sort({ createdAt: -1 });
  if (!record || new Date() > record.expiresAt) {
    throw new ApiError(400, 'Verification code expired or not found. Please request a new one.');
  }

  if (record.otpHash !== hashToken(otp)) {
    throw new ApiError(400, 'Invalid verification code. Please check your email.');
  }

  // Consume OTP
  await Otp.deleteMany({ email: cleanEmail, purpose: 'register' });

  // Create User
  const user = await User.create({
    name,
    email: cleanEmail,
    timezone: timezone || 'UTC',
  });

  // Welcome email
  sendWelcomeEmail(user).catch(console.error);

  // No auth cookies issued! Direct the user to log in on the login page.
  res.status(201).json(
    new ApiResponse(201, { user: sanitiseUser(user) }, 'Registration verified successfully! Please log in.')
  );
});

/**
 * POST /auth/send-login-otp
 * Verifies captcha, ensures user exists, generates & emails 6-digit login OTP.
 * Rejects requests from API testers without valid captcha.
 */
export const sendLoginOtp = asyncHandler(async (req, res) => {
  const { email, captchaToken, captchaAnswer } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  // Enforce captcha verification
  verifyCaptchaAnswer(captchaToken, captchaAnswer);

  const user = await User.findOne({ email: cleanEmail, isActive: true });
  if (!user) {
    throw new ApiError(404, 'No account found with this email. Please register first.');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = hashToken(otp);

  // Store OTP with 10-minute expiration
  await Otp.deleteMany({ email: cleanEmail, purpose: 'login' });
  await Otp.create({
    email: cleanEmail,
    otpHash,
    purpose: 'login',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // Send via EmailJS
  await sendOtpEmail(cleanEmail, user.name, otp, 'login');

  res.json(new ApiResponse(200, null, 'Login code sent to your email.'));
});

/**
 * POST /auth/login-otp
 * Verifies OTP and completes login. Issues JWT access & refresh tokens in httpOnly cookies.
 */
export const loginOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail, isActive: true });
  if (!user) {
    throw new ApiError(404, 'Account not found. Please sign up.');
  }

  const record = await Otp.findOne({ email: cleanEmail, purpose: 'login' }).sort({ createdAt: -1 });
  if (!record || new Date() > record.expiresAt) {
    throw new ApiError(400, 'Login code expired or not found. Please request a new code.');
  }

  if (record.otpHash !== hashToken(otp)) {
    throw new ApiError(400, 'Invalid login code. Please check your email.');
  }

  // Consume OTP
  await Otp.deleteMany({ email: cleanEmail, purpose: 'login' });

  // Issue session cookies
  const { accessToken, refreshToken } = setAuthCookies(res, user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.json(
    new ApiResponse(200, { user: sanitiseUser(user), accessToken }, 'Logged in successfully')
  );
});

/**
 * POST /auth/login (Legacy password login with mandatory captcha)
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password, captchaToken, captchaAnswer } = req.body;

  // Enforce captcha protection against API testers
  verifyCaptchaAnswer(captchaToken, captchaAnswer);

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
  if (!user || !user.isActive || !user.passwordHash) {
    throw new ApiError(401, 'Invalid credentials');
  }

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
export const getUsers = asyncHandler(async (_req, res) => {
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
