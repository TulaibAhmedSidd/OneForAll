import connectToDB from '@/lib/db';
import { handler, json } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { joinGame } from '@/lib/games';
import { objectId } from '@/lib/validators';
import User from '@/models/User';

export const POST = handler(async (req, { params }) => {
  await connectToDB();
  const user = await requireUser();
  const gameId = objectId.parse(params.id);
  await rateLimit(`join:${user._id}`, 30, 60, 'You are joining too fast. Slow down a little.');

  const entry = await joinGame(user, gameId);
  const fresh = await User.findById(user._id).select('walletBalance').lean();
  return json({ ticketNo: entry.ticketNo, walletBalance: fresh.walletBalance });
});
