import mongoose from 'mongoose';

// One ticket per user per game. ticketNo is the seat number (1..requiredUsers).
const entrySchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: String,
    ticketNo: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'refunded'], default: 'confirmed' },
  },
  { timestamps: true }
);

// Stops double-joins even when two requests race.
entrySchema.index({ gameId: 1, userId: 1 }, { unique: true });
entrySchema.index({ gameId: 1, ticketNo: 1 }, { unique: true });
entrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Entry || mongoose.model('Entry', entrySchema);
