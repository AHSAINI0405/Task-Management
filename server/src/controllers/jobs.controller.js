import { z } from 'zod';
import JobApplication, { JOB_STATUSES } from '../models/JobApplication.model.js';
import Reminder from '../models/Reminder.model.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ── Zod schemas ────────────────────────────────────────────────────────

export const createJobSchema = z.object({
  company:            z.string().min(1).max(200),
  role:               z.string().min(1).max(200),
  jobUrl:             z.string().url().optional().default(''),
  location:           z.string().max(200).optional().default(''),
  status:             z.enum(JOB_STATUSES).optional().default('Wishlist'),
  dateApplied:        z.coerce.date().nullable().optional(),
  followUpDate:       z.coerce.date().nullable().optional(),
  scheduledApplyDate: z.coerce.date().nullable().optional(),
  salary:             z.string().max(100).optional().default(''),
  notes:              z.string().max(5000).optional().default(''),
});

export const updateJobSchema = createJobSchema.partial();

export const jobStatusSchema = z.object({
  status: z.enum(JOB_STATUSES),
});

// ── Controllers ───────────────────────────────────────────────────────

/** GET /jobs */
export const getJobs = asyncHandler(async (req, res) => {
  const { status, search, sort = '-createdAt', page = '1', limit = '20' } = req.query;
  const filter = { userId: req.user._id };
  if (status) filter.status = status;
  if (search) filter.$text  = { $search: search };

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const [jobs, total] = await Promise.all([
    JobApplication.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
    JobApplication.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, {
    jobs,
    pagination: { total, page: parseInt(page), limit: parseInt(limit) },
  }));
});

/** GET /jobs/pipeline — grouped by status for Kanban */
export const getJobPipeline = asyncHandler(async (req, res) => {
  const groups = await JobApplication.aggregate([
    { $match: { userId: req.user._id } },
    { $group: {
        _id:   '$status',
        jobs:  { $push: '$$ROOT' },
        count: { $sum: 1 },
    }},
  ]);

  // Build a map keyed by status for consistent ordering
  const pipeline = {};
  JOB_STATUSES.forEach((s) => (pipeline[s] = { status: s, jobs: [], count: 0 }));
  groups.forEach((g) => {
    if (pipeline[g._id]) {
      pipeline[g._id].jobs  = g.jobs;
      pipeline[g._id].count = g.count;
    }
  });

  res.json(new ApiResponse(200, { pipeline: Object.values(pipeline) }));
});

/** POST /jobs */
export const createJob = asyncHandler(async (req, res) => {
  const job = await JobApplication.create({ ...req.body, userId: req.user._id });

  // Auto-create a follow-up reminder if followUpDate provided
  if (job.followUpDate) {
    await createFollowUpReminder(job, req.user._id);
  }
  // Auto-create "time to apply" reminder if scheduledApplyDate provided
  if (job.scheduledApplyDate) {
    await createScheduledApplyReminder(job, req.user._id);
  }

  res.status(201).json(new ApiResponse(201, { job }, 'Job application created'));
});

/** GET /jobs/:id */
export const getJob = asyncHandler(async (req, res) => {
  const job = await findOwnedJob(req.params.id, req.user._id);
  res.json(new ApiResponse(200, { job }));
});

/** PUT /jobs/:id */
export const updateJob = asyncHandler(async (req, res) => {
  const existing = await findOwnedJob(req.params.id, req.user._id);
  const updated  = await JobApplication.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });

  // Re-sync follow-up reminder if followUpDate changed
  if (req.body.followUpDate && req.body.followUpDate !== existing.followUpDate?.toISOString()) {
    await Reminder.deleteMany({ refId: updated._id, refType: 'JobApplication', message: /follow.up/i });
    if (req.body.followUpDate) await createFollowUpReminder(updated, req.user._id);
  }

  res.json(new ApiResponse(200, { job: updated }, 'Job updated'));
});

/** PATCH /jobs/:id/status */
export const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  await findOwnedJob(req.params.id, req.user._id);
  const update = { status };
  if (status === 'Applied' && !req.body.dateApplied) {
    update.dateApplied = new Date();
  }
  const job = await JobApplication.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(new ApiResponse(200, { job }, 'Status updated'));
});

/** DELETE /jobs/:id */
export const deleteJob = asyncHandler(async (req, res) => {
  await findOwnedJob(req.params.id, req.user._id);
  await Promise.all([
    JobApplication.findByIdAndDelete(req.params.id),
    Reminder.deleteMany({ refId: req.params.id, refType: 'JobApplication' }),
  ]);
  res.json(new ApiResponse(200, null, 'Job application deleted'));
});

// ── Helpers ───────────────────────────────────────────────────────────

async function findOwnedJob(id, userId) {
  const job = await JobApplication.findOne({ _id: id, userId });
  if (!job) throw new ApiError(404, 'Job application not found');
  return job;
}

async function createFollowUpReminder(job, userId) {
  try {
    const reminder = await Reminder.create({
      userId,
      refType: 'JobApplication',
      refId:   job._id,
      fireAt:  job.followUpDate,
      message: `Follow-up reminder for ${job.role} at ${job.company}`,
      channel: 'both',
    });
    await JobApplication.findByIdAndUpdate(job._id, {
      $addToSet: { reminderIds: reminder._id },
    });
  } catch (err) {
    // Duplicate unique index error — reminder already exists
    if (err.code !== 11000) throw err;
  }
}

async function createScheduledApplyReminder(job, userId) {
  try {
    const reminder = await Reminder.create({
      userId,
      refType: 'JobApplication',
      refId:   job._id,
      fireAt:  job.scheduledApplyDate,
      message: `Scheduled: Apply to ${job.role} at ${job.company}`,
      channel: 'both',
    });
    await JobApplication.findByIdAndUpdate(job._id, {
      $addToSet: { reminderIds: reminder._id },
    });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
}
