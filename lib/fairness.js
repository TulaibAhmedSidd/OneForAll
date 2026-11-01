import crypto from 'crypto';

// Provably fair draw.
// 1. When a game is created we pick a random secret seed and publish sha256(seed).
// 2. Tickets are numbered 1..N in the order people join.
// 3. At the draw, winning ticket i is HMAC-SHA256(seed, `${gameId}:${i}`) mapped onto 1..N
//    (rejection sampling, duplicates skipped). The seed is then published, so anyone can
//    re-run this and check that nobody — including us — changed the result.

export function newSeed() {
  const seed = crypto.randomBytes(32).toString('hex');
  return { seed, hash: sha256(seed) };
}

export function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function pickWinningTickets(seed, gameId, totalTickets, count) {
  const n = BigInt(totalTickets);
  const space = 1n << 256n;
  const limit = space - (space % n); // reject values above this to avoid modulo bias
  const picked = [];
  const seen = new Set();
  for (let i = 0; picked.length < Math.min(count, totalTickets); i++) {
    const hex = crypto.createHmac('sha256', seed).update(`${gameId}:${i}`).digest('hex');
    const value = BigInt(`0x${hex}`);
    if (value >= limit) continue;
    const ticket = Number(value % n) + 1;
    if (seen.has(ticket)) continue;
    seen.add(ticket);
    picked.push(ticket);
  }
  return picked;
}
