import mongoose from 'mongoose';

// Append-only ledger. Sum of `amount` for a user always equals their walletBalance.
const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transactionType: {
      type: String,
      enum: ['top-up', 'game-participation', 'game-win', 'refund', 'withdrawal', 'withdrawal-reversal', 'adjustment'],
      required: true,
    },
    amount: { type: Number, required: true }, // signed: + credit, - debit
    balanceAfterTransaction: { type: Number, required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: null },
    note: { type: String, default: '' },
    // Unique key per business event (e.g. "entry:<gameId>:<userId>") so a retry can never double-credit.
    idempotencyKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.WalletTransaction ||
  mongoose.model('WalletTransaction', walletTransactionSchema);
