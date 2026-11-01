import connectToDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import { handler, json, readJson, HttpError } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { reviewSchema, objectId } from '@/lib/validators';
import { withTxn, moveMoney } from '@/lib/wallet';

// Approve a deposit -> credit wallet. Reject a withdrawal -> give the held money back.
// The status flip and the money move share a transaction, so a double click cannot pay twice.
export const POST = handler(async (req, { params }) => {
  await connectToDB();
  const admin = await requireAdmin();
  const id = objectId.parse(params.id);
  const { action, note } = reviewSchema.parse(await readJson(req));
  const status = action === 'approve' ? 'approved' : 'rejected';

  const doc = await withTxn(async (session) => {
    const r = await PaymentRequest.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: { status, adminNote: note, reviewedBy: admin._id, reviewedAt: new Date() } },
      { new: true, session }
    );
    if (!r) throw new HttpError(409, 'This request was already reviewed.');

    if (r.kind === 'deposit' && status === 'approved') {
      await moveMoney(session, { userId: r.userId, amount: r.amount, type: 'top-up', key: `deposit:${r._id}`, note: `Deposit via ${r.method} (${r.reference})` });
    }
    if (r.kind === 'withdrawal' && status === 'rejected') {
      await moveMoney(session, { userId: r.userId, amount: r.amount, type: 'withdrawal-reversal', key: `withdraw-reverse:${r._id}`, note: note || 'Withdrawal rejected' });
    }
    return r;
  });
  return json({ id: String(doc._id), status: doc.status });
});
