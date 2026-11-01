import connectToDB from '@/lib/db';
import Game from '@/models/Game';
import { handler, json } from '@/lib/http';
import { serializeGame } from '@/lib/games';

export const dynamic = 'force-dynamic';

// Public list of open games plus the latest results. Cached at the edge for 15s so
// a traffic spike hits Vercel's CDN, not the database.
export const GET = handler(async () => {
  await connectToDB();
  const [open, recent] = await Promise.all([
    Game.find({ status: 'active', endTime: { $gt: new Date() } }).sort({ endTime: 1 }).limit(60).lean(),
    Game.find({ status: 'completed' }).sort({ drawnAt: -1 }).limit(12).lean(),
  ]);
  return json(
    { open: open.map(serializeGame), recent: recent.map(serializeGame) },
    { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' } }
  );
});
