import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import Task from '../models/Task.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads');

export const VALID_STATUSES = ['Idea', 'To Do', 'In Progress', 'In Review', 'Completed'];
export const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// ── Validation Schemas ─────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title:       z.string().min(1, 'Task title is required').max(250),
  description: z.string().min(1, 'Task description is required').max(10000),
  status:      z.enum(['Idea', 'To Do', 'In Progress', 'In Review', 'Completed']).optional().default('Idea'),
  priority:    z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  assignee:    z.string().nullable().optional(),
  dueDate:     z.coerce.date().nullable().optional(),
  labels:      z.union([z.array(z.string()), z.string()]).optional(),
});

export const updateTaskSchema = z.object({
  title:       z.string().min(1).max(250).optional(),
  description: z.string().min(1).max(10000).optional(),
  status:      z.enum(['Idea', 'To Do', 'In Progress', 'In Review', 'Completed']).optional(),
  priority:    z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  assignee:    z.string().nullable().optional(),
  dueDate:     z.coerce.date().nullable().optional(),
  labels:      z.union([z.array(z.string()), z.string()]).optional(),
  comment:     z.string().optional(),
});

export const statusSchema = z.object({
  status:  z.enum(['Idea', 'To Do', 'In Progress', 'In Review', 'Completed']),
  comment: z.string().optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────

/** Helper to check if user can view / edit task */
async function getAuthorizedTask(taskId, userId, requireManage = false) {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const isCreator  = task.creator.toString() === userId.toString();
  const isAssignee = task.assignee && task.assignee.toString() === userId.toString();

  if (requireManage && !isCreator && !isAssignee) {
    throw new ApiError(403, 'Unauthorized: Only the creator or assigned user can perform this action.');
  }

  return { task, isCreator, isAssignee };
}

/** Generate next sequential Jira-style task key (e.g. TASK-101, TASK-102) */
async function generateNextTaskKey() {
  const latest = await Task.findOne({}, { taskKey: 1 }).sort({ createdAt: -1 });
  let nextNum = 101;
  if (latest && latest.taskKey && latest.taskKey.startsWith('TASK-')) {
    const parsed = parseInt(latest.taskKey.replace('TASK-', ''), 10);
    if (!isNaN(parsed)) nextNum = parsed + 1;
  }
  return `TASK-${nextNum}`;
}

// ── Controllers ───────────────────────────────────────────────────────

/** GET /tasks - List tasks with filtering, search, and Jira board views */
export const getTasks = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    assignee,
    view, // 'all', 'assignedToMe', 'createdByMe'
    search,
    label,
    sort = '-createdAt',
  } = req.query;

  const filter = {};

  // View-based filtering
  if (view === 'assignedToMe') {
    filter.assignee = req.user._id;
  } else if (view === 'createdByMe') {
    filter.creator = req.user._id;
  }

  if (status && VALID_STATUSES.includes(status)) {
    filter.status = status;
  }

  if (priority && VALID_PRIORITIES.includes(priority)) {
    filter.priority = priority;
  }

  if (assignee) {
    if (assignee === 'unassigned') {
      filter.assignee = null;
    } else {
      filter.assignee = assignee;
    }
  }

  if (label) {
    filter.labels = label;
  }

  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { taskKey:     { $regex: s, $options: 'i' } },
      { title:       { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { labels:      { $regex: s, $options: 'i' } },
    ];
  }

  const tasks = await Task.find(filter)
    .populate('creator', '_id name email')
    .populate('assignee', '_id name email')
    .populate('statusHistory.changedBy', '_id name email')
    .populate('attachments.uploadedBy', '_id name email')
    .sort(sort);

  res.json(
    new ApiResponse(200, {
      tasks,
      total: tasks.length,
    }),
  );
});

/** POST /tasks - Create task with optional attachments */
export const createTask = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  // Parse labels if sent as string (e.g. from FormData)
  if (typeof body.labels === 'string') {
    try {
      body.labels = JSON.parse(body.labels);
    } catch {
      body.labels = body.labels.split(',').map((l) => l.trim()).filter(Boolean);
    }
  }

  // Handle assignee if string 'null' or empty
  if (body.assignee === '' || body.assignee === 'null' || body.assignee === 'undefined') {
    body.assignee = null;
  }

  // Handle dueDate if empty
  if (body.dueDate === '' || body.dueDate === 'null' || body.dueDate === 'undefined') {
    body.dueDate = null;
  }

  const validated = createTaskSchema.parse(body);
  const taskKey = await generateNextTaskKey();

  // Process attachments if files were uploaded via multipart
  const attachments = [];
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      attachments.push({
        filename:     file.filename,
        originalName: file.originalname,
        mimetype:     file.mimetype,
        size:         file.size,
        url:          `/uploads/${file.filename}`,
        uploadedBy:   req.user._id,
        createdAt:    new Date(),
      });
    }
  }

  const initialStatus = validated.status || 'Idea';

  const task = await Task.create({
    taskKey,
    title:       validated.title,
    description: validated.description,
    status:      initialStatus,
    priority:    validated.priority || 'Medium',
    creator:     req.user._id,
    userId:      req.user._id,
    assignee:    validated.assignee || null,
    dueDate:     validated.dueDate || null,
    labels:      Array.isArray(validated.labels) ? validated.labels : [],
    attachments,
    statusHistory: [
      {
        fromStatus: 'Created',
        toStatus:   initialStatus,
        changedBy:  req.user._id,
        changedAt:  new Date(),
        comment:    'Task created',
      },
    ],
    completedAt: initialStatus === 'Completed' ? new Date() : null,
  });

  const populated = await Task.findById(task._id)
    .populate('creator', '_id name email')
    .populate('assignee', '_id name email')
    .populate('statusHistory.changedBy', '_id name email')
    .populate('attachments.uploadedBy', '_id name email');

  res.status(201).json(new ApiResponse(201, { task: populated }, 'Task created successfully'));
});

/** GET /tasks/:id - View task details */
export const getTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { taskKey: id }],
  })
    .populate('creator', '_id name email')
    .populate('assignee', '_id name email')
    .populate('statusHistory.changedBy', '_id name email')
    .populate('attachments.uploadedBy', '_id name email');

  if (!task) throw new ApiError(404, 'Task not found');

  res.json(new ApiResponse(200, { task }));
});

/** PUT /tasks/:id - Edit task */
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { task } = await getAuthorizedTask(id, req.user._id, true);

  const body = { ...req.body };

  if (typeof body.labels === 'string') {
    try {
      body.labels = JSON.parse(body.labels);
    } catch {
      body.labels = body.labels.split(',').map((l) => l.trim()).filter(Boolean);
    }
  }

  if (body.assignee === '' || body.assignee === 'null' || body.assignee === 'undefined') {
    body.assignee = null;
  }

  if (body.dueDate === '' || body.dueDate === 'null' || body.dueDate === 'undefined') {
    body.dueDate = null;
  }

  const validated = updateTaskSchema.parse(body);

  // Check if status changed
  if (validated.status && validated.status !== task.status) {
    task.statusHistory.push({
      fromStatus: task.status,
      toStatus:   validated.status,
      changedBy:  req.user._id,
      changedAt:  new Date(),
      comment:    validated.comment || `Status updated to ${validated.status}`,
    });

    task.status = validated.status;
    task.completedAt = validated.status === 'Completed' ? new Date() : null;
  }

  if (validated.title !== undefined)       task.title = validated.title;
  if (validated.description !== undefined) task.description = validated.description;
  if (validated.priority !== undefined)    task.priority = validated.priority;
  if (validated.assignee !== undefined)    task.assignee = validated.assignee;
  if (validated.dueDate !== undefined)     task.dueDate = validated.dueDate;
  if (validated.labels !== undefined)      task.labels = Array.isArray(validated.labels) ? validated.labels : [];

  // If new files were uploaded along with PUT
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    for (const file of req.files) {
      task.attachments.push({
        filename:     file.filename,
        originalName: file.originalname,
        mimetype:     file.mimetype,
        size:         file.size,
        url:          `/uploads/${file.filename}`,
        uploadedBy:   req.user._id,
        createdAt:    new Date(),
      });
    }
  }

  await task.save();

  const populated = await Task.findById(task._id)
    .populate('creator', '_id name email')
    .populate('assignee', '_id name email')
    .populate('statusHistory.changedBy', '_id name email')
    .populate('attachments.uploadedBy', '_id name email');

  res.json(new ApiResponse(200, { task: populated }, 'Task updated successfully'));
});

/** PATCH /tasks/:id/status - Update task status (Kanban drag-and-drop or status selector) */
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, comment } = statusSchema.parse(req.body);

  const { task } = await getAuthorizedTask(id, req.user._id, true);

  if (task.status === status) {
    return res.json(new ApiResponse(200, { task }, 'Status already matches'));
  }

  const oldStatus = task.status;
  task.status = status;
  task.completedAt = status === 'Completed' ? new Date() : null;

  task.statusHistory.push({
    fromStatus: oldStatus,
    toStatus:   status,
    changedBy:  req.user._id,
    changedAt:  new Date(),
    comment:    comment || `Status moved from ${oldStatus} to ${status}`,
  });

  await task.save();

  const populated = await Task.findById(task._id)
    .populate('creator', '_id name email')
    .populate('assignee', '_id name email')
    .populate('statusHistory.changedBy', '_id name email')
    .populate('attachments.uploadedBy', '_id name email');

  res.json(new ApiResponse(200, { task: populated }, `Status updated to ${status}`));
});

/** DELETE /tasks/:id - Permanently delete task after confirmation */
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { task } = await getAuthorizedTask(id, req.user._id, true);

  // Remove uploaded attachment files from disk
  if (task.attachments && task.attachments.length > 0) {
    for (const att of task.attachments) {
      const filePath = path.join(uploadDir, att.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error(`Failed to delete file ${att.filename}:`, e);
        }
      }
    }
  }

  await Task.findByIdAndDelete(task._id);

  res.json(new ApiResponse(200, { deletedId: task._id, taskKey: task.taskKey }, 'Task deleted successfully'));
});

/** POST /tasks/:id/attachments - Upload attachments to an existing task */
export const uploadAttachments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { task } = await getAuthorizedTask(id, req.user._id, true);

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new ApiError(400, 'No files were uploaded');
  }

  const newAttachments = [];
  for (const file of req.files) {
    newAttachments.push({
      filename:     file.filename,
      originalName: file.originalname,
      mimetype:     file.mimetype,
      size:         file.size,
      url:          `/uploads/${file.filename}`,
      uploadedBy:   req.user._id,
      createdAt:    new Date(),
    });
  }

  task.attachments.push(...newAttachments);
  await task.save();

  const populated = await Task.findById(task._id)
    .populate('creator', '_id name email')
    .populate('assignee', '_id name email')
    .populate('statusHistory.changedBy', '_id name email')
    .populate('attachments.uploadedBy', '_id name email');

  res.json(new ApiResponse(200, { task: populated }, 'Attachments uploaded successfully'));
});

/** DELETE /tasks/:id/attachments/:attachmentId - Remove an attachment */
export const deleteAttachment = asyncHandler(async (req, res) => {
  const { id, attachmentId } = req.params;
  const { task } = await getAuthorizedTask(id, req.user._id, true);

  const att = task.attachments.id(attachmentId);
  if (!att) throw new ApiError(404, 'Attachment not found');

  // Remove file from disk
  const filePath = path.join(uploadDir, att.filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error(`Failed to delete file ${att.filename}:`, e);
    }
  }

  task.attachments.pull(attachmentId);
  await task.save();

  const populated = await Task.findById(task._id)
    .populate('creator', '_id name email')
    .populate('assignee', '_id name email')
    .populate('statusHistory.changedBy', '_id name email')
    .populate('attachments.uploadedBy', '_id name email');

  res.json(new ApiResponse(200, { task: populated }, 'Attachment removed successfully'));
});

/** GET /tasks/:id/attachments/:attachmentId/download - Download attachment */
export const downloadAttachment = asyncHandler(async (req, res) => {
  const { id, attachmentId } = req.params;
  const task = await Task.findById(id);
  if (!task) throw new ApiError(404, 'Task not found');

  const att = task.attachments.id(attachmentId);
  if (!att) throw new ApiError(404, 'Attachment not found');

  const filePath = path.join(uploadDir, att.filename);
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, 'File not found on server');
  }

  res.download(filePath, att.originalName);
});
