import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: null },
    password: { type: String, required: true, select: false },
    // Whole rupees. Only ever changed through lib/wallet.js so every change has a ledger row.
    walletBalance: { type: Number, default: 0, min: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    gamesPlayed: { type: Number, default: 0 },
    prizesWon: { type: Number, default: 0 },
    // Bumped on logout-everywhere / password change to invalidate old tokens.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
