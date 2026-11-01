import connectToDB from '@/lib/db';
import Game from '@/models/Game';
import { handler, json, readJson, HttpError } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { updateGameSchema, objectId } from '@/lib/validators';
import { serializeGame, drawGame, cancelGame } from '@/lib/games';

export const maxDuration = 60;

// Only cosmetic fields, pause and end time can change after creation.
// Fee, seats and prizes are locked so nobody's paid ticket changes underneath them.
export const PATCH = handler(async (req, { params }) => {
  await connectToDB();
  await requireAdmin();
  const id = objectId.parse(params.id);
  const data = updateGameSchema.parse(await readJson(req));

  const game = await Game.findById(id);
  if (!game) throw new HttpError(404, 'Game not found');
  if (game.status !== 'active') throw new HttpError(409, 'Only open games can be edited.');
  if (data.endTime && data.endTime < game.endTime) throw new HttpError(400, 'End time can only be extended, not shortened.');

  Object.assign(game, data);
  await game.save();
  return json({ game: serializeGame(game) });
});

// POST { action: 'draw' | 'cancel' | 'deliver', reason?, prizeId?, ticketNo? }
export const POST = handler(async (req, { params }) => {
  await connectToDB();
  await requireAdmin();
  const id = objectId.parse(params.id);
  const body = await readJson(req);

  if (body.action === 'draw') return json({ game: serializeGame(await drawGame(id, { force: true })) });
  if (body.action === 'cancel') {
    const reason = String(body.reason || 'Cancelled by admin').slice(0, 200);
    const result = await cancelGame(id, reason);
    return json({ game: serializeGame(result), refundsPending: result.refundsPending });
  }
  if (body.action === 'deliver') {
    const res = await Game.updateOne(
      { _id: id, 'gamePrize._id': body.prizeId },
      { $set: { 'gamePrize.$[p].winners.$[w].delivered': true } },
      { arrayFilters: [{ 'p._id': body.prizeId }, { 'w.ticketNo': Number(body.ticketNo) }] }
    );
    if (!res.modifiedCount) throw new HttpError(404, 'Winner not found');
    return json({ ok: true });
  }
  throw new HttpError(400, 'Unknown action');
});
