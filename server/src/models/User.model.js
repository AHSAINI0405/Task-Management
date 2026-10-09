import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    passwordHash: { type: String, required: false, default: null, select: false },

    timezone: { type: String, default: 'UTC' },

    // Stored hashed — never store raw tokens in DB
    refreshTokenHash:    { type: String, default: null, select: false },
    passwordResetToken:  { type: String, default: null, select: false },
    passwordResetExpiry: { type: Date,   default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
