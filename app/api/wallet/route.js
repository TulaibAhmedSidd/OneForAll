import connectToDB from '@/lib/db';
import WalletTransaction from '@/models/WalletTransaction';
import PaymentRequest from '@/models/PaymentRequest';
import { handler, json } from '@/lib/http';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = handler(async (req) => {
  await connectToDB();
  const user = await requireUser();
  const before = req.nextUrl.searchParams.get('before');
  const q = { userId: user._id };
  if (before) q.createdAt = { $lt: new Date(before) };

  const [history, requests] = await Promise.all([
    WalletTransaction.find(q).sort({ createdAt: -1 }).limit(30).lean(),
    PaymentRequest.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  return json({
    walletBalance: user.walletBalance,
    history: history.map((t) => ({ id: String(t._id), type: t.transactionType, amount: t.amount, balance: t.balanceAfterTransaction, note: t.note, at: t.createdAt })),
    requests: requests.map((r) => ({ id: String(r._id), kind: r.kind, method: r.method, amount: r.amount, status: r.status, at: r.createdAt, note: r.adminNote })),
  });
});
