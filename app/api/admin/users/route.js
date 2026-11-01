import connectToDB from '@/lib/db';
import User from '@/models/User';
import { handler, json } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const GET = handler(async (req) => {
  await connectToDB();
  await requireAdmin();
  const q = (req.nextUrl.searchParams.get('q') || '').trim().slice(0, 60);
  const filter = q ? { $or: [{ email: new RegExp(`^${escape(q.toLowerCase())}`) }, { username: new RegExp(escape(q), 'i') }, { phone: new RegExp(`^${escape(q)}`) }] } : {};
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(50).lean();
  return json({
    users: users.map((u) => ({
      id: String(u._id), username: u.username, email: u.email, phone: u.phone || '', walletBalance: u.walletBalance,
      gamesPlayed: u.gamesPlayed || 0, prizesWon: u.prizesWon || 0, isAdmin: !!u.isAdmin, isBlocked: !!u.isBlocked, createdAt: u.createdAt,
    })),
  });
});
