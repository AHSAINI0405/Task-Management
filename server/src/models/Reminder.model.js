import mongoose from 'mongoose';

export const REMINDER_CHANNELS  = ['email', 'push', 'both'];
export const REMINDER_REF_TYPES = ['Task', 'JobApplication', 'Event'];

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // Polymorphic reference
    refType: { type: String, enum: REMINDER_REF_TYPES, required: true },
    refId:   { type: mongoose.Schema.Types.ObjectId, required: true },

    message: { type: String, default: '', maxlength: 500 },

    // Exact UTC moment to fire
    fireAt: { type: Date, required: true },

    channel: {
      type:    String,
      enum:    REMINDER_CHANNELS,
      default: 'both',
    },

    sent:       { type: Boolean, default: false },
    sentAt:     { type: Date,    default: null  },
    failed:     { type: Boolean, default: false },
    failReason: { type: String,  default: ''    },
  },
  { timestamps: true },
);

// Primary scheduler query: unsent reminders due now
reminderSchema.index({ sent: 1, fireAt: 1 });
// Dedup check: one reminder per (user, ref, time)
reminderSchema.index({ userId: 1, refId: 1, refType: 1, fireAt: 1 }, { unique: true });

export default mongoose.model('Reminder', reminderSchema);
