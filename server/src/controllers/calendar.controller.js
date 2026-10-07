import { z } from 'zod';
import Task           from '../models/Task.model.js';
import JobApplication from '../models/JobApplication.model.js';
import Event          from '../models/Event.model.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const calendarQuerySchema = z.object({
  from: z.coerce.date(),
  to:   z.coerce.date(),
});

/**
 * GET /calendar?from=ISO&to=ISO
 * Returns all tasks, jobs (by scheduledApplyDate / dateApplied / followUpDate),
 * and events (by nextOccurrence) that fall in the requested range —
 * merged into a single array tagged by `_type`.
 */
export const getCalendarItems = asyncHandler(async (req, res) => {
  const result = calendarQuerySchema.safeParse(req.query);
  if (!result.success) throw new ApiError(400, 'from and to query params are required ISO dates');

  const { from, to } = result.data;
  if (to < from)     throw new ApiError(400, '`to` must be after `from`');

  const userId = req.user._id;
  const range  = { $gte: from, $lte: to };

  const [tasks, jobs, events] = await Promise.all([
    Task.find({ userId, dueDate: range }).select('title dueDate priority status category tags'),
    JobApplication.find({
      userId,
      $or: [
        { scheduledApplyDate: range },
        { dateApplied: range },
        { followUpDate: range },
      ],
    }).select('company role status scheduledApplyDate dateApplied followUpDate'),
    Event.find({ userId, nextOccurrence: range }).select('title type person nextOccurrence repeatsYearly'),
  ]);

  const items = [
    ...tasks.map((t) => ({ ...t.toObject(), _type: 'task',  _date: t.dueDate })),
    ...jobs.map((j) => ({
      ...j.toObject(),
      _type: 'job',
      _date: j.scheduledApplyDate || j.followUpDate || j.dateApplied,
    })),
    ...events.map((e) => ({ ...e.toObject(), _type: 'event', _date: e.nextOccurrence })),
  ].sort((a, b) => new Date(a._date) - new Date(b._date));

  res.json(new ApiResponse(200, { items, from, to }));
});
