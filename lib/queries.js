// Read helpers for server components. They return plain serializable objects.
import connectToDB from './db';
import Game from '@/models/Game';
import Entry from '@/models/Entry';
import WalletTransaction from '@/models/WalletTransaction';
import PaymentRequest from '@/models/PaymentRequest';
import { serializeGame, drawGame } from './games';
import { getSettings } from './settings';

export async function openGames(limit = 60) {
  await connectToDB();
  const games = await Game.find({ status: 'active', endTime: { $gt: new Date() } }).sort({ endTime: 1 }).limit(limit).lean();
  return games.map(serializeGame);
}

export async function recentResults(limit = 8) {
  await connectToDB();
  const games = await Game.find({ status: 'completed' }).sort({ drawnAt: -1 }).limit(limit).lean();
  return games.map(serializeGame);
}

export async function gameDetail(id, user) {
  await connectToDB();
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  let game = await Game.findById(id).lean();
  if (!game) return null;
  if (game.status === 'active' && new Date(game.endTime) <= new Date()) {
    await drawGame(game._id).catch(() => null);
    game = await Game.findById(id).lean();
  }
  const mine = user ? await Entry.findOne({ gameId: game._id, userId: user._id }).lean() : null;
  return { game: serializeGame(game), myTicket: mine ? { ticketNo: mine.ticketNo, status: mine.status } : null };
}

export async function myTicketsMap(user, gameIds) {
  if (!user || !gameIds.length) return {};
  const entries = await Entry.find({ userId: user._id, gameId: { $in: gameIds } }).select('gameId ticketNo').lean();
  return Object.fromEntries(entries.map((e) => [String(e.gameId), e.ticketNo]));
}

export async function myTickets(user) {
  await connectToDB();
  const entries = await Entry.find({ userId: user._id }).sort({ createdAt: -1 }).limit(60).lean();
  const games = await Game.find({ _id: { $in: entries.map((e) => e.gameId) } }).lean();
  const byId = new Map(games.map((g) => [String(g._id), g]));
  return entries
    .filter((e) => byId.has(String(e.gameId)))
    .map((e) => {
      const g = byId.get(String(e.gameId));
      const won = (g.gamePrize || []).find((p) => (p.winners || []).some((w) => String(w.userId) === String(user._id)));
      return { ticketNo: e.ticketNo, status: e.status, won: won ? won.name : null, game: serializeGame(g) };
    });
}

export async function walletData(user) {
  await connectToDB();
  const [history, requests, settings] = await Promise.all([
    WalletTransaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(40).lean(),
    PaymentRequest.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10).lean(),
    getSettings(),
  ]);
  return {
    settings,
    history: history.map((t) => ({ id: String(t._id), type: t.transactionType, amount: t.amount, balance: t.balanceAfterTransaction, note: t.note, at: t.createdAt.toISOString() })),
    requests: requests.map((r) => ({ id: String(r._id), kind: r.kind, method: r.method, amount: r.amount, status: r.status, at: r.createdAt.toISOString(), note: r.adminNote || '' })),
  };
}
