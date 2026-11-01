import connectToDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import { handler, json } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = handler(async (req) => {
  await connectToDB();
  await requireAdmin();
  const sp = req.nextUrl.searchParams;
  const q = { kind: sp.get('kind') === 'withdrawal' ? 'withdrawal' : 'deposit', status: sp.get('status') || 'pending' };
  const rows = await PaymentRequest.find(q).sort({ createdAt: q.status === 'pending' ? 1 : -1 }).limit(100).lean();
  return json({
    requests: rows.map((r) => ({
      id: String(r._id), username: r.username, kind: r.kind, method: r.method, amount: r.amount, reference: r.reference,
      accountName: r.accountName, accountNumber: r.accountNumber, status: r.status, note: r.adminNote, at: r.createdAt,
    })),
  });
});
