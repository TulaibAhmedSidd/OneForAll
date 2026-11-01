import connectToDB from '@/lib/db';
import Game from '@/models/Game';
import Entry from '@/models/Entry';
import { handler, json, HttpError } from '@/lib/http';
import { serializeGame, drawGame } from '@/lib/games';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = handler(async (req, { params }) => {
  await connectToDB();
  let game = await Game.findById(params.id).lean();
  if (!game) throw new HttpError(404, 'Game not found');

  // Time is up but nobody ran the draw yet: settle it now (idempotent).
  if (game.status === 'active' && new Date(game.endTime) <= new Date()) {
    await drawGame(game._id).catch(() => null);
    game = await Game.findById(params.id).lean();
  }

  const user = await getSessionUser();
  const mine = user ? await Entry.findOne({ gameId: game._id, userId: user._id }).lean() : null;
  return json({ game: serializeGame(game), myTicket: mine ? { ticketNo: mine.ticketNo, status: mine.status } : null });
});
