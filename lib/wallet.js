import mongoose from 'mongoose';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { HttpError } from './http';

// Runs fn inside a MongoDB transaction (Atlas / any replica set). withTransaction
// retries automatically on write conflicts, which is what makes concurrent joins safe.
export async function withTxn(fn) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

// Every balance change goes through here: balance update + ledger row in the same transaction.
// The idempotencyKey is unique, so repeating the same event throws a duplicate-key error
// and the whole transaction rolls back instead of paying twice.
export async function moveMoney(session, { userId, amount, type, key, gameId = null, note = '', extraInc = {} }) {
  if (!Number.isInteger(amount) || amount === 0) throw new HttpError(400, 'Amount must be a whole number');
  const filter = { _id: userId };
  if (amount < 0) filter.walletBalance = { $gte: -amount };

  const user = await User.findOneAndUpdate(
    filter,
    { $inc: { walletBalance: amount, ...extraInc } },
    { new: true, session, projection: { walletBalance: 1, username: 1 } }
  );
  if (!user) {
    throw amount < 0 ? new HttpError(402, 'Not enough balance. Add money to your wallet first.') : new HttpError(404, 'User not found');
  }

  await WalletTransaction.create(
    [{ userId, transactionType: type, amount, balanceAfterTransaction: user.walletBalance, gameId, note, idempotencyKey: key }],
    { session }
  );
  return user;
}

// Like moveMoney in its own transaction, but a repeat of the same key is treated as "already done".
export async function moveMoneyOnce(args) {
  try {
    return await withTxn((session) => moveMoney(session, args));
  } catch (err) {
    if (err?.code === 11000) return null;
    throw err;
  }
}
