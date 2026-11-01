import mongoose from 'mongoose';

// Deposits and withdrawals that a person on the team checks by hand until a
// payment gateway (Easypaisa / JazzCash merchant API) is connected.
const paymentRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: String,
    kind: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    method: { type: String, enum: ['easypaisa', 'jazzcash', 'bank'], required: true },
    amount: { type: Number, required: true, min: 1 },
    // deposit: the sender's transaction ID; withdrawal: where to send the money
    reference: { type: String, required: true, trim: true },
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

paymentRequestSchema.index({ status: 1, kind: 1, createdAt: -1 });
paymentRequestSchema.index({ userId: 1, createdAt: -1 });
// The same Easypaisa/JazzCash transaction ID can only be claimed once.
paymentRequestSchema.index(
  { kind: 1, method: 1, reference: 1 },
  { unique: true, partialFilterExpression: { kind: 'deposit' } }
);

export default mongoose.models.PaymentRequest || mongoose.model('PaymentRequest', paymentRequestSchema);
