import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema(
  {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type:     String,
      required: true,
      unique:   true,
      lowercase: true,
      trim:     true,
    },
    passwordHash: { type: String, required: true, select: false },

    timezone:      { type: String, default: 'UTC' },
    notifyByEmail: { type: Boolean, default: true },
    notifyByPush:  { type: Boolean, default: true },

    pushSubscriptions: { type: [pushSubscriptionSchema], default: [] },

    // Stored hashed — never store raw tokens in DB
    refreshTokenHash:    { type: String, default: null, select: false },
    passwordResetToken:  { type: String, default: null, select: false },
    passwordResetExpiry: { type: Date,   default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
