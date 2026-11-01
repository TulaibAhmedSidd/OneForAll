import connectToDB from '@/lib/db';
import Game from '@/models/Game';
import User from '@/models/User';
import { handler, json, HttpError } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { objectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

// Full winner contact details for delivering prizes. Admin only.
export const GET = handler(async (req, { params }) => {
  await connectToDB();
  await requireAdmin();
  const game = await Game.findById(objectId.parse(params.id)).lean();
  if (!game) throw new HttpError(404, 'Game not found');

  const ids = game.gamePrize.flatMap((p) => p.winners.map((w) => w.userId));
  const users = await User.find({ _id: { $in: ids } }).select('username email phone').lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return json({
    prizes: game.gamePrize.map((p) => ({
      id: String(p._id),
      name: p.name,
      type: p.type,
      winners: p.winners.map((w) => {
        const u = byId.get(String(w.userId)) || {};
        return { ticketNo: w.ticketNo, username: u.username || w.username, email: u.email || '', phone: u.phone || '', delivered: !!w.delivered };
      }),
    })),
  });
});
