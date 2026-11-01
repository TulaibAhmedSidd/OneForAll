import crypto from 'crypto';
import connectToDB from '@/lib/db';
import User from '@/models/User';
import { handler, json, readJson, HttpError } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { adjustSchema, objectId } from '@/lib/validators';
import { withTxn, moveMoney } from '@/lib/wallet';

export const PATCH = handler(async (req, { params }) => {
  await connectToDB();
  const admin = await requireAdmin();
  const id = objectId.parse(params.id);
  const data = adjustSchema.parse(await readJson(req));

  if (typeof data.isBlocked === 'boolean') {
    if (String(admin._id) === id) throw new HttpError(400, 'You cannot block yourself.');
    // Bumping tokenVersion signs the user out everywhere.
    await User.updateOne({ _id: id }, { $set: { isBlocked: data.isBlocked }, $inc: { tokenVersion: 1 } });
  }

  if (data.adjustAmount) {
    if (!data.adjustNote) throw new HttpError(400, 'Write a reason for the balance change.');
    await withTxn((session) =>
      moveMoney(session, {
        userId: id,
        amount: data.adjustAmount,
        type: 'adjustment',
        key: `adjust:${id}:${crypto.randomUUID()}`,
        note: `${data.adjustNote} (by ${admin.email})`,
      })
    );
  }
  const u = await User.findById(id).lean();
  return json({ walletBalance: u?.walletBalance, isBlocked: !!u?.isBlocked });
});
