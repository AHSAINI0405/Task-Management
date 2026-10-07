import mongoose from 'mongoose';

export const JOB_STATUSES = [
  'Wishlist',
  'Applied',
  'Phone Screen',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    company:  { type: String, required: true, trim: true, maxlength: 200 },
    role:     { type: String, required: true, trim: true, maxlength: 200 },
    jobUrl:   { type: String, default: '', maxlength: 2000 },
    location: { type: String, default: '', maxlength: 200 },

    status: {
      type:    String,
      enum:    JOB_STATUSES,
      default: 'Wishlist',
    },

    dateApplied:  { type: Date, default: null },
    followUpDate: { type: Date, default: null },

    // "apply to this job on [date]" — scheduler checks this field
    scheduledApplyDate: { type: Date, default: null },

    salary: { type: String, default: '', maxlength: 100 },
    notes:  { type: String, default: '', maxlength: 5000 },

    // IDs of auto-created Reminder docs
    reminderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reminder' }],
  },
  { timestamps: true },
);

jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, followUpDate: 1 });
jobSchema.index({ userId: 1, scheduledApplyDate: 1 });
jobSchema.index({ company: 'text', role: 'text', notes: 'text' });

export default mongoose.model('JobApplication', jobSchema);
