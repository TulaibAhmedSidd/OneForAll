import connectToDB from '@/lib/db';
import Entry from '@/models/Entry';
import Game from '@/models/Game';
import { handler, json } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { serializeGame } from '@/lib/games';

export const dynamic = 'force-dynamic';

export const GET = handler(async () => {
  await connectToDB();
  const user = await requireUser();
  const entries = await Entry.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50).lean();
  const games = await Game.find({ _id: { $in: entries.map((e) => e.gameId) } }).lean();
  const byId = new Map(games.map((g) => [String(g._id), g]));
  return json({
    tickets: entries
      .filter((e) => byId.has(String(e.gameId)))
      .map((e) => ({ ticketNo: e.ticketNo, status: e.status, game: serializeGame(byId.get(String(e.gameId))) })),
  });
});
