import { z } from 'zod';
import Reminder, { REMINDER_CHANNELS, REMINDER_REF_TYPES } from '../models/Reminder.model.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ── Zod schemas ────────────────────────────────────────────────────────

export const createReminderSchema = z.object({
  refType:  z.enum(REMINDER_REF_TYPES),
  refId:    z.string().min(1),
  fireAt:   z.coerce.date(),
  channel:  z.enum(REMINDER_CHANNELS).optional().default('both'),
  message:  z.string().max(500).optional().default(''),
});

export const updateReminderSchema = z.object({
  fireAt:  z.coerce.date().optional(),
  channel: z.enum(REMINDER_CHANNELS).optional(),
  message: z.string().max(500).optional(),
});

// ── Controllers ───────────────────────────────────────────────────────

/** GET /reminders */
export const getReminders = asyncHandler(async (req, res) => {
  const { refType, sent, upcoming } = req.query;
  const filter = { userId: req.user._id };
  if (refType)  filter.refType = refType;
  if (sent !== undefined) filter.sent = sent === 'true';
  if (upcoming === 'true') {
    filter.sent  = false;
    filter.fireAt = { $gte: new Date() };
  }

  const reminders = await Reminder.find(filter).sort('fireAt');
  res.json(new ApiResponse(200, { reminders }));
});

/** POST /reminders */
export const createReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.create({
    ...req.body,
    userId: req.user._id,
  });
  res.status(201).json(new ApiResponse(201, { reminder }, 'Reminder created'));
});

/** PUT /reminders/:id */
export const updateReminder = asyncHandler(async (req, res) => {
  await findOwnedReminder(req.params.id, req.user._id);

  // Reset sent flag if fire time changes
  if (req.body.fireAt) {
    req.body.sent   = false;
    req.body.sentAt = null;
  }

  const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  res.json(new ApiResponse(200, { reminder }, 'Reminder updated'));
});

/** DELETE /reminders/:id */
export const deleteReminder = asyncHandler(async (req, res) => {
  await findOwnedReminder(req.params.id, req.user._id);
  await Reminder.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Reminder deleted'));
});

// ── Helpers ───────────────────────────────────────────────────────────

async function findOwnedReminder(id, userId) {
  const reminder = await Reminder.findOne({ _id: id, userId });
  if (!reminder) throw new ApiError(404, 'Reminder not found');
  return reminder;
}
