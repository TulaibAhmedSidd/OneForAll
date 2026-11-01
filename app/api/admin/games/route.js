import connectToDB from '@/lib/db';
import Game from '@/models/Game';
import { handler, json, readJson } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { createGameSchema } from '@/lib/validators';
import { createGame, serializeGame } from '@/lib/games';

export const dynamic = 'force-dynamic';

export const GET = handler(async (req) => {
  await connectToDB();
  await requireAdmin();
  const status = req.nextUrl.searchParams.get('status');
  const q = status ? { status } : {};
  const games = await Game.find(q).sort({ createdAt: -1 }).limit(100).lean();
  return json({ games: games.map(serializeGame) });
});

export const POST = handler(async (req) => {
  await connectToDB();
  const admin = await requireAdmin();
  const data = createGameSchema.parse(await readJson(req));
  const game = await createGame(admin._id, data);
  return json({ game: serializeGame(game) }, { status: 201 });
});
