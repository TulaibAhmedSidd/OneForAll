import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    ticketNo: Number,
    delivered: { type: Boolean, default: false },
  },
  { _id: false }
);

const gamePrizeSchema = new mongoose.Schema({
  prize: { type: mongoose.Schema.Types.ObjectId, ref: 'GamePrize' },
  // Snapshot of the catalogue prize at creation time.
  name: String,
  image: String,
  worth: Number,
  type: { type: String, enum: ['item', 'cash'], default: 'item' },
  quantity: { type: Number, required: true, min: 1 },
  winners: [winnerSchema],
});

const gameSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    gameAmount: { type: Number, required: true, min: 1 }, // entry fee in rupees
    requiredUsers: { type: Number, required: true, min: 1 }, // seats
    // Participants live in the Entry collection. Keeping them out of this document
    // avoids the 16 MB document limit and keeps "join" a tiny counter update.
    entriesCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      // active = open for entries, drawing = draw in progress (lock), completed = winners picked
      enum: ['active', 'drawing', 'completed', 'cancelled'],
      default: 'active',
    },
    paused: { type: Boolean, default: false },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    gamePrize: [gamePrizeSchema],
    // Provably fair draw: hash is public from day one, seed is revealed after the draw.
    seedHash: { type: String, required: true },
    serverSeed: { type: String, select: false },
    seedRevealed: { type: String, default: null },
    drawnAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
    refundedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

gameSchema.index({ status: 1, endTime: 1 });
gameSchema.index({ createdAt: -1 });

gameSchema.virtual('totalPrizes').get(function () {
  return (this.gamePrize || []).reduce((sum, p) => sum + (p.quantity || 0), 0);
});

export default mongoose.models.Game || mongoose.model('Game', gameSchema);
