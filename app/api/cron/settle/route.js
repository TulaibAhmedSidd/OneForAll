import connectToDB from '@/lib/db';
import { handler, json, HttpError } from '@/lib/http';
import { settleDueGames } from '@/lib/games';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Vercel Cron calls this with "Authorization: Bearer $CRON_SECRET".
export const GET = handler(async (req) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) throw new HttpError(401, 'Unauthorized');
  await connectToDB();
  return json({ settled: await settleDueGames(50) });
});
