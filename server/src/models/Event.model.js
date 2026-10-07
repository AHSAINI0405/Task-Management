import mongoose from 'mongoose';

export const EVENT_TYPES = ['birthday', 'anniversary', 'holiday', 'custom'];

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    title:        { type: String, required: true, trim: true, maxlength: 200 },
    type:         { type: String, enum: EVENT_TYPES, default: 'birthday' },
    person:       { type: String, default: '', maxlength: 200 },
    relationship: { type: String, default: '', maxlength: 100 },
    note:         { type: String, default: '', maxlength: 1000 },

    // Full date stored; for repeatsYearly events, only month+day matters.
    // Always store with UTC midnight for consistency.
    date: { type: Date, required: true },

    repeatsYearly: { type: Boolean, default: true },

    // Pre-computed UTC timestamp of next occurrence.
    // Refreshed nightly by birthday.job.js
    nextOccurrence: { type: Date, default: null },
  },
  { timestamps: true },
);

eventSchema.index({ userId: 1, date: 1 });
eventSchema.index({ userId: 1, nextOccurrence: 1 });

export default mongoose.model('Event', eventSchema);
