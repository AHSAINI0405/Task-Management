import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    filename:     { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype:     { type: String, required: true },
    size:         { type: Number, required: true },
    url:          { type: String, required: true },
    uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt:    { type: Date, default: Date.now },
  },
  { _id: true },
);

const statusHistorySchema = new mongoose.Schema(
  {
    fromStatus: { type: String, required: true },
    toStatus:   { type: String, required: true },
    changedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt:  { type: Date, default: Date.now },
    comment:    { type: String, default: '' },
  },
  { _id: true },
);

const taskSchema = new mongoose.Schema(
  {
    taskKey: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },

    title: {
      type:      String,
      required:  [true, 'Task title is required'],
      trim:      true,
      maxlength: 250,
    },

    description: {
      type:      String,
      required:  [true, 'Task description is required'],
      trim:      true,
      maxlength: 10000,
    },

    status: {
      type:    String,
      enum:    ['Idea', 'To Do', 'In Progress', 'In Review', 'Completed'],
      default: 'Idea',
      index:   true,
    },

    priority: {
      type:    String,
      enum:    ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index:   true,
    },

    // Creator / Reporter
    creator: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // Kept synchronized with creator for backwards-compatibility
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // Assignee (can be null if unassigned)
    assignee: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
      index:   true,
    },

    dueDate: {
      type:    Date,
      default: null,
    },

    labels: {
      type:    [{ type: String, trim: true, maxlength: 50 }],
      default: [],
    },

    attachments: {
      type:    [attachmentSchema],
      default: [],
    },

    statusHistory: {
      type:    [statusHistorySchema],
      default: [],
    },

    completedAt: {
      type:    Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Indexes for fast querying
taskSchema.index({ creator: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text', labels: 'text' });

export default mongoose.model('Task', taskSchema);
