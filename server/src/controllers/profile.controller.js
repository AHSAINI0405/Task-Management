import { z } from 'zod';
import User from '../models/User.model.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword, comparePassword } from '../services/token.service.js';

// ── Zod schemas ────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name:          z.string().min(2).max(100).optional(),
  timezone:      z.string().optional(),
  notifyByEmail: z.boolean().optional(),
  notifyByPush:  z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).max(72),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth:   z.string(),
  }),
});

// ── Controllers ───────────────────────────────────────────────────────

/** PUT /profile */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, timezone, notifyByEmail, notifyByPush } = req.body;

  const updates = {};
  if (name          !== undefined) updates.name          = name;
  if (timezone      !== undefined) updates.timezone      = timezone;
  if (notifyByEmail !== undefined) updates.notifyByEmail = notifyByEmail;
  if (notifyByPush  !== undefined) updates.notifyByPush  = notifyByPush;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new:        true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, { user }, 'Profile updated'));
});

/** PUT /profile/password */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');
  const match = await comparePassword(currentPassword, user.passwordHash);
  if (!match) throw new ApiError(401, 'Current password is incorrect');

  user.passwordHash     = await hashPassword(newPassword);
  user.refreshTokenHash = null; // log out other sessions
  await user.save();

  res.json(new ApiResponse(200, null, 'Password changed — please log in again'));
});

/** POST /profile/push-subscribe */
export const addPushSubscription = asyncHandler(async (req, res) => {
  const sub = req.body;

  // Prevent duplicate endpoints
  const user = req.user;
  const exists = user.pushSubscriptions.some((s) => s.endpoint === sub.endpoint);
  if (!exists) {
    await User.findByIdAndUpdate(user._id, {
      $push: { pushSubscriptions: sub },
    });
  }

  res.json(new ApiResponse(200, null, 'Push subscription saved'));
});

/** DELETE /profile/push-subscribe */
export const removePushSubscription = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) throw new ApiError(400, 'endpoint is required');

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { pushSubscriptions: { endpoint } },
  });

  res.json(new ApiResponse(200, null, 'Push subscription removed'));
});
