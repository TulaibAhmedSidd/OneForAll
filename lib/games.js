import Game from '@/models/Game';
import Entry from '@/models/Entry';
import GamePrize from '@/models/GamePrize';
import User from '@/models/User';
import { HttpError } from './http';
import { withTxn, moveMoney, moveMoneyOnce } from './wallet';
import { newSeed, pickWinningTickets } from './fairness';

const STUCK_DRAW_MS = 2 * 60 * 1000;

export function totalPrizes(game) {
  return (game.gamePrize || []).reduce((s, p) => s + (p.quantity || 0), 0);
}

export async function createGame(adminId, input) {
  const ids = input.prizes.map((p) => p.prizeId);
  const catalogue = await GamePrize.find({ _id: { $in: ids } }).lean();
  const byId = new Map(catalogue.map((p) => [String(p._id), p]));

  const gamePrize = input.prizes.map((p) => {
    const c = byId.get(p.prizeId);
    if (!c) throw new HttpError(400, 'One of the selected prizes no longer exists');
    return { prize: c._id, name: c.prizeName, image: c.prizeImage, worth: c.prizeWorth, type: c.type || 'item', quantity: p.quantity };
  });

  const prizeCount = gamePrize.reduce((s, p) => s + p.quantity, 0);
  if (prizeCount > input.requiredUsers) throw new HttpError(400, 'There are more prizes than seats');

  const { seed, hash } = newSeed();
  const game = await Game.create({
    adminId,
    gameName: input.gameName,
    description: input.description || '',
    gameAmount: input.gameAmount,
    requiredUsers: input.requiredUsers,
    startTime: input.startTime,
    endTime: input.endTime,
    gamePrize,
    seedHash: hash,
    serverSeed: seed,
  });
  return game;
}

// Buys one ticket. Seat, wallet debit, ticket and ledger row commit together or not at all.
export async function joinGame(user, gameId) {
  const now = new Date();
  let filled = false;

  const entry = await withTxn(async (session) => {
    const game = await Game.findOneAndUpdate(
      {
        _id: gameId,
        status: 'active',
        paused: false,
        startTime: { $lte: now },
        endTime: { $gt: now },
        $expr: { $lt: ['$entriesCount', '$requiredUsers'] },
      },
      { $inc: { entriesCount: 1 } },
      { new: true, session, projection: { entriesCount: 1, requiredUsers: 1, gameAmount: 1 } }
    );
    if (!game) throw await whyCannotJoin(gameId, now);

    const already = await Entry.exists({ gameId, userId: user._id }).session(session);
    if (already) throw new HttpError(409, 'You already have a ticket in this game.');

    await moveMoney(session, {
      userId: user._id,
      amount: -game.gameAmount,
      type: 'game-participation',
      key: `entry:${gameId}:${user._id}`,
      gameId,
      note: `Ticket #${game.entriesCount}`,
      extraInc: { gamesPlayed: 1 },
    });

    const [created] = await Entry.create(
      [{ gameId, userId: user._id, username: user.username, ticketNo: game.entriesCount, amount: game.gameAmount }],
      { session }
    );
    filled = game.entriesCount >= game.requiredUsers;
    return created;
  });

  if (filled) {
    // Last seat sold: run the draw now. If it fails the settle job / admin can retry safely.
    await drawGame(gameId).catch((err) => console.error('[draw after fill]', gameId, err));
  }
  return entry;
}

async function whyCannotJoin(gameId, now) {
  const g = await Game.findById(gameId).lean();
  if (!g) return new HttpError(404, 'Game not found');
  if (g.status !== 'active') return new HttpError(409, 'This game is closed.');
  if (g.paused) return new HttpError(409, 'This game is paused for a moment.');
  if (g.startTime > now) return new HttpError(409, 'This game has not opened yet.');
  if (g.endTime <= now) return new HttpError(409, 'Entries for this game have closed.');
  if (g.entriesCount >= g.requiredUsers) return new HttpError(409, 'All tickets are sold.');
  return new HttpError(409, 'Could not join right now. Try again.');
}

// Picks winners. Safe to call many times: only one caller wins the lock, and a crashed
// draw can be resumed because winner selection is deterministic and payouts are idempotent.
// force=true lets an admin draw before the game is full / has ended.
export async function drawGame(gameId, { force = false } = {}) {
  const now = new Date();
  const due = force
    ? {}
    : { $or: [{ endTime: { $lte: now } }, { $expr: { $gte: ['$entriesCount', '$requiredUsers'] } }] };

  let game = await Game.findOneAndUpdate(
    {
      _id: gameId,
      $or: [
        { status: 'active', ...due },
        { status: 'drawing', updatedAt: { $lt: new Date(Date.now() - STUCK_DRAW_MS) } },
      ],
    },
    { $set: { status: 'drawing' } },
    { new: true }
  ).select('+serverSeed');

  if (!game) {
    const current = await Game.findById(gameId).lean();
    if (!current) throw new HttpError(404, 'Game not found');
    if (current.status === 'completed') return current;
    if (current.status === 'cancelled') throw new HttpError(409, 'This game was cancelled.');
    if (current.status === 'drawing') throw new HttpError(409, 'The draw is already running.');
    throw new HttpError(409, 'This game is not ready for a draw yet.');
  }

  const prizeSlots = totalPrizes(game);
  if (game.entriesCount < prizeSlots) {
    // Not enough players for every prize: refund everyone instead of a half draw.
    return cancelGame(gameId, `Only ${game.entriesCount} of the ${prizeSlots} needed players joined. Everyone was refunded.`, { fromDraw: true });
  }

  const tickets = pickWinningTickets(game.serverSeed, String(game._id), game.entriesCount, prizeSlots);
  const entries = await Entry.find({ gameId, ticketNo: { $in: tickets } }).lean();
  const byTicket = new Map(entries.map((e) => [e.ticketNo, e]));

  let cursor = 0;
  for (const prize of game.gamePrize) {
    prize.winners = [];
    for (let q = 0; q < prize.quantity; q++) {
      const entry = byTicket.get(tickets[cursor++]);
      if (!entry) continue;
      prize.winners.push({ userId: entry.userId, username: entry.username, ticketNo: entry.ticketNo, delivered: prize.type === 'cash' });
      if (prize.type === 'cash' && prize.worth > 0) {
        await moveMoneyOnce({
          userId: entry.userId,
          amount: Math.round(prize.worth),
          type: 'game-win',
          key: `prize:${game._id}:${entry.ticketNo}`,
          gameId: game._id,
          note: `Won ${prize.name} — ${game.gameName}`,
          extraInc: { prizesWon: 1 },
        });
      } else {
        await User.updateOne({ _id: entry.userId }, { $inc: { prizesWon: 1 } });
      }
    }
  }

  game.status = 'completed';
  game.seedRevealed = game.serverSeed;
  game.drawnAt = new Date();
  await game.save();
  return game.toObject();
}

// Cancels a game and refunds every ticket. Re-running finishes any refunds left over.
export async function cancelGame(gameId, reason = 'Cancelled by admin', { fromDraw = false } = {}) {
  const allowed = fromDraw ? ['drawing'] : ['active', 'drawing', 'cancelled'];
  const game = await Game.findOneAndUpdate(
    { _id: gameId, status: { $in: allowed } },
    { $set: { status: 'cancelled', cancelReason: reason } },
    { new: true }
  );
  if (!game) throw new HttpError(409, 'Completed games cannot be cancelled.');

  const deadline = Date.now() + 45_000; // stay inside the serverless time limit
  const pending = Entry.find({ gameId, status: 'confirmed' }).lean().cursor();
  let left = false;
  for await (const e of pending) {
    if (Date.now() > deadline) { left = true; break; }
    await moveMoneyOnce({
      userId: e.userId,
      amount: e.amount,
      type: 'refund',
      key: `refund:${gameId}:${e.userId}`,
      gameId,
      note: `Refund — ${game.gameName}`,
      extraInc: { gamesPlayed: -1 },
    });
    await Entry.updateOne({ _id: e._id }, { $set: { status: 'refunded' } });
  }
  if (!left) await Game.updateOne({ _id: gameId }, { $set: { refundedAt: new Date() } });
  return { ...game.toObject(), refundsPending: left };
}

// Draws (or refunds) every game whose time is up. Called by cron, admin, and lazily on page views.
export async function settleDueGames(limit = 20) {
  const due = await Game.find({ status: 'active', endTime: { $lte: new Date() } })
    .sort({ endTime: 1 })
    .limit(limit)
    .select('_id')
    .lean();
  const results = [];
  for (const g of due) {
    try {
      const r = await drawGame(g._id);
      results.push({ id: String(g._id), status: r.status });
    } catch (err) {
      results.push({ id: String(g._id), error: err.message });
    }
  }
  return results;
}

// What the public sees. Never includes the secret seed or other users' emails.
export function serializeGame(g) {
  const prizes = (g.gamePrize || []).map((p) => ({
    id: String(p._id),
    name: p.name,
    image: p.image,
    worth: p.worth,
    type: p.type,
    quantity: p.quantity,
    winners: (p.winners || []).map((w) => ({ username: maskName(w.username), ticketNo: w.ticketNo, delivered: !!w.delivered })),
  }));
  return {
    id: String(g._id),
    name: g.gameName,
    description: g.description || '',
    fee: g.gameAmount,
    seats: g.requiredUsers,
    sold: g.entriesCount || 0,
    status: g.status,
    paused: !!g.paused,
    startTime: new Date(g.startTime).toISOString(),
    endTime: new Date(g.endTime).toISOString(),
    prizes,
    prizeWorth: prizes.reduce((s, p) => s + (p.worth || 0) * p.quantity, 0),
    seedHash: g.seedHash,
    seedRevealed: g.seedRevealed || null,
    drawnAt: g.drawnAt ? new Date(g.drawnAt).toISOString() : null,
    cancelReason: g.cancelReason || null,
  };
}

export function maskName(name = '') {
  if (name.length <= 2) return `${name[0] || '*'}*`;
  return `${name.slice(0, 2)}${'*'.repeat(Math.min(4, name.length - 2))}${name.slice(-1)}`;
}
