import { z } from 'zod';
import Event, { EVENT_TYPES } from '../models/Event.model.js';
import Reminder from '../models/Reminder.model.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getNextYearlyOccurrence, addDays } from '../utils/timezone.js';

// ── Zod schemas ────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  title:         z.string().min(1).max(200),
  type:          z.enum(EVENT_TYPES).optional().default('birthday'),
  person:        z.string().max(200).optional().default(''),
  relationship:  z.string().max(100).optional().default(''),
  note:          z.string().max(1000).optional().default(''),
  date:          z.coerce.date(),
  repeatsYearly: z.boolean().optional().default(true),
});

export const updateEventSchema = createEventSchema.partial();

// ── Controllers ───────────────────────────────────────────────────────

/** GET /events */
export const getEvents = asyncHandler(async (req, res) => {
  const { type, search, sort = 'date' } = req.query;
  const filter = { userId: req.user._id };
  if (type)   filter.type  = type;
  if (search) filter.$text = { $search: search };

  const events = await Event.find(filter).sort(sort);
  res.json(new ApiResponse(200, { events }));
});

/** GET /events/upcoming — events in next 30 days */
export const getUpcomingEvents = asyncHandler(async (req, res) => {
  const now  = new Date();
  const soon = addDays(now, 30);
  const events = await Event.find({
    userId:         req.user._id,
    nextOccurrence: { $gte: now, $lte: soon },
  }).sort('nextOccurrence');
  res.json(new ApiResponse(200, { events }));
});

/** POST /events */
export const createEvent = asyncHandler(async (req, res) => {
  const data = req.body;

  // Compute next occurrence immediately
  const nextOccurrence = data.repeatsYearly
    ? getNextYearlyOccurrence(data.date, req.user.timezone)
    : data.date;

  const event = await Event.create({
    ...data,
    userId: req.user._id,
    nextOccurrence,
  });

  // Create yearly birthday reminders (7 days before, 1 day before, day-of)
  if (data.repeatsYearly) {
    await scheduleYearlyReminders(event, req.user._id);
  }

  res.status(201).json(new ApiResponse(201, { event }, 'Event created'));
});

/** GET /events/:id */
export const getEvent = asyncHandler(async (req, res) => {
  const event = await findOwnedEvent(req.params.id, req.user._id);
  res.json(new ApiResponse(200, { event }));
});

/** PUT /events/:id */
export const updateEvent = asyncHandler(async (req, res) => {
  await findOwnedEvent(req.params.id, req.user._id);

  const data = req.body;
  if (data.date && data.repeatsYearly !== false) {
    data.nextOccurrence = getNextYearlyOccurrence(
      new Date(data.date),
      req.user.timezone,
    );
  }

  const event = await Event.findByIdAndUpdate(req.params.id, data, {
    new: true, runValidators: true,
  });

  // Rebuild reminders on date change
  if (data.date || data.repeatsYearly !== undefined) {
    await Reminder.deleteMany({ refId: event._id, refType: 'Event' });
    if (event.repeatsYearly) {
      await scheduleYearlyReminders(event, req.user._id);
    }
  }

  res.json(new ApiResponse(200, { event }, 'Event updated'));
});

/** DELETE /events/:id */
export const deleteEvent = asyncHandler(async (req, res) => {
  await findOwnedEvent(req.params.id, req.user._id);
  await Promise.all([
    Event.findByIdAndDelete(req.params.id),
    Reminder.deleteMany({ refId: req.params.id, refType: 'Event' }),
  ]);
  res.json(new ApiResponse(200, null, 'Event deleted'));
});

// ── Helpers ───────────────────────────────────────────────────────────

async function findOwnedEvent(id, userId) {
  const event = await Event.findOne({ _id: id, userId });
  if (!event) throw new ApiError(404, 'Event not found');
  return event;
}

/**
 * Create 3 reminders: 7 days before, 1 day before, and on the day.
 * Uses upsert-style insertions; duplicate unique index silently skips.
 */
async function scheduleYearlyReminders(event, userId) {
  const base = event.nextOccurrence;
  if (!base) return;

  const offsets = [
    { days: 7, label: '7 days'  },
    { days: 1, label: '1 day'   },
    { days: 0, label: 'today'   },
  ];

  const reminders = offsets.map(({ days, label }) => ({
    userId,
    refType: 'Event',
    refId:   event._id,
    fireAt:  addDays(base, -days),
    message: `${event.title} is ${label === 'today' ? 'today' : `in ${label}`}! 🎉`,
    channel: 'both',
  }));

  // insertMany with ordered:false so one duplicate doesn't abort the rest
  await Reminder.insertMany(reminders, { ordered: false }).catch((err) => {
    if (err.code !== 11000 && err.name !== 'BulkWriteError') throw err;
  });
}
