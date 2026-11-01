// End-to-end API checks for the money paths. Run against a dev server + `npm run db`:
//   BASE=http://localhost:3100 npm run test:api
import crypto from 'crypto';
import assert from 'assert/strict';

const BASE = process.env.BASE || 'http://localhost:3000';
const run = Date.now().toString(36);
let passed = 0;

async function call(path, { method = 'GET', body, cookie, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data, cookie: setCookie ? setCookie.split(';')[0] : null };
}

function ok(name, cond, extra) {
  assert.ok(cond, `${name} ${extra ? JSON.stringify(extra) : ''}`);
  passed++;
  console.log('  ✓', name);
}

async function register(name, email) {
  const r = await call('/api/auth/register', { method: 'POST', headers: { 'x-real-ip': `10.0.${run.length}.${Math.floor(Math.random() * 250)}` }, body: { username: name, email, password: 'password123', ageConfirmed: true } });
  ok(`register ${name}`, r.status === 201, r.data);
  return r.cookie;
}

async function topUp(admin, cookie, amount) {
  const ref = `TID${crypto.randomBytes(5).toString('hex')}`;
  const d = await call('/api/wallet/deposit', { method: 'POST', cookie, body: { method: 'easypaisa', amount, reference: ref } });
  assert.equal(d.status, 201, JSON.stringify(d.data));
  const a = await call(`/api/admin/payments/${d.data.id}`, { method: 'POST', cookie: admin, body: { action: 'approve' } });
  assert.equal(a.status, 200, JSON.stringify(a.data));
  return { id: d.data.id, ref };
}

const balance = async (cookie) => (await call('/api/wallet', { cookie })).data.walletBalance;

console.log('Auth & access');
let admin = (await call('/api/auth/login', { method: 'POST', body: { email: 'admin@oneforall.test', password: 'password123' } })).cookie;
if (!admin) admin = await register('Admin', 'admin@oneforall.test');
const me = await call('/api/auth/me', { cookie: admin });
ok('admin email becomes admin', me.data.user.isAdmin === true);
ok('login hides password hash', !JSON.stringify(me.data).includes('$2'));

const users = [];
for (let i = 0; i < 7; i++) users.push(await register(`Player${i}`, `p${i}.${run}@test.pk`));
ok('duplicate email rejected', (await call('/api/auth/register', { method: 'POST', headers: { 'x-real-ip': '10.9.9.1' }, body: { username: 'Xavier', email: `p0.${run}@test.pk`, password: 'password123', ageConfirmed: true } })).status === 409);
ok('under-18 confirmation required', (await call('/api/auth/register', { method: 'POST', headers: { 'x-real-ip': '10.9.9.2' }, body: { username: 'Xavier', email: `kid.${run}@test.pk`, password: 'password123' } })).status === 400);
ok('wrong password rejected', (await call('/api/auth/login', { method: 'POST', body: { email: `p0.${run}@test.pk`, password: 'nope-nope' } })).status === 401);
ok('player cannot open admin API', (await call('/api/admin/stats', { cookie: users[0] })).status === 403);
ok('guest cannot open admin API', (await call('/api/admin/stats')).status === 401);
ok('cross-site POST blocked', (await call('/api/auth/logout', { method: 'POST', headers: { origin: 'https://evil.example' } })).status === 403);

console.log('Prizes & games');
const cash = await call('/api/admin/prizes', { method: 'POST', cookie: admin, body: { prizeName: 'Rs 20 cash', prizeImage: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', prizeWorth: 20, type: 'cash' } });
const item = await call('/api/admin/prizes', { method: 'POST', cookie: admin, body: { prizeName: 'Earbuds', prizeImage: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', prizeWorth: 3000, type: 'item' } });
ok('prizes created', cash.status === 201 && item.status === 201);

const now = Date.now();
const mkGame = (seats, extra = {}) =>
  call('/api/admin/games', {
    method: 'POST', cookie: admin,
    body: { gameName: `Test pool ${run}`, gameAmount: 5, requiredUsers: seats, startTime: new Date(now - 60000).toISOString(), endTime: new Date(now + 3600000).toISOString(), prizes: [{ prizeId: cash.data.id, quantity: 1 }, { prizeId: item.data.id, quantity: 1 }], ...extra },
  });
ok('more prizes than seats rejected', (await mkGame(1)).status === 400);
const g1 = await mkGame(5);
ok('game created', g1.status === 201, g1.data);
const gid = g1.data.game.id;
ok('secret seed not exposed', !('serverSeed' in g1.data.game) && g1.data.game.seedHash.length === 64);
ok('player cannot create games', (await call('/api/admin/games', { method: 'POST', cookie: users[0], body: {} })).status === 403);

console.log('Wallet');
ok('guest cannot join', (await call(`/api/games/${gid}/join`, { method: 'POST' })).status === 401);
ok('cannot join with Rs 0', (await call(`/api/games/${gid}/join`, { method: 'POST', cookie: users[0] })).status === 402);
const dep = await call('/api/wallet/deposit', { method: 'POST', cookie: users[0], body: { method: 'easypaisa', amount: 100, reference: `DUP${run}` } });
ok('deposit stays pending (no free money)', dep.status === 201 && (await balance(users[0])) === 0);
ok('same transaction ID cannot be claimed twice', (await call('/api/wallet/deposit', { method: 'POST', cookie: users[1], body: { method: 'easypaisa', amount: 100, reference: `DUP${run}` } })).status === 409);
const [ap1, ap2] = await Promise.all([
  call(`/api/admin/payments/${dep.data.id}`, { method: 'POST', cookie: admin, body: { action: 'approve' } }),
  call(`/api/admin/payments/${dep.data.id}`, { method: 'POST', cookie: admin, body: { action: 'approve' } }),
]);
ok('double-click approve pays once', [ap1.status, ap2.status].sort().join() === '200,409' && (await balance(users[0])) === 100, [ap1.status, ap2.status]);
ok('negative deposit rejected', (await call('/api/wallet/deposit', { method: 'POST', cookie: users[1], body: { method: 'easypaisa', amount: -50, reference: 'NEG12345' } })).status === 400);
for (let i = 1; i < 7; i++) await topUp(admin, users[i], 50);

console.log('Joining under load');
const dbl = await Promise.all([1, 2, 3].map(() => call(`/api/games/${gid}/join`, { method: 'POST', cookie: users[0] })));
ok('same user racing 3 joins gets one ticket', dbl.filter((r) => r.status === 200).length === 1, dbl.map((r) => [r.status, r.data]));
ok('charged exactly once', (await balance(users[0])) === 95);
const race = await Promise.all(users.slice(1).map((c) => call(`/api/games/${gid}/join`, { method: 'POST', cookie: c })));
const wins = race.filter((r) => r.status === 200).length;
ok('6 players racing for 4 seats: exactly 4 get in', wins === 4, race.map((r) => [r.status, r.data?.error]));
const losers = users.slice(1).filter((_, i) => race[i].status !== 200);
for (const c of losers) ok('player who missed out was not charged', (await balance(c)) === 50);

console.log('Draw');
const detail = await call(`/api/games/${gid}`, { cookie: users[0] });
const g = detail.data.game;
ok('full game drew automatically', g.status === 'completed', g.status);
ok('seed revealed after draw', g.seedRevealed && crypto.createHash('sha256').update(g.seedRevealed).digest('hex') === g.seedHash);
const winners = g.prizes.flatMap((p) => p.winners);
ok('2 distinct winners', winners.length === 2 && new Set(winners.map((w) => w.ticketNo)).size === 2);
// Recompute the draw like an outsider would.
const picked = [];
for (let i = 0; picked.length < 2; i++) {
  const v = BigInt('0x' + crypto.createHmac('sha256', g.seedRevealed).update(`${gid}:${i}`).digest('hex'));
  const t = Number(v % 5n) + 1;
  if (!picked.includes(t)) picked.push(t);
}
ok('anyone can re-run the draw and get the same winners', picked.join() === winners.map((w) => w.ticketNo).join(), { picked, winners });
const redraw = await call(`/api/admin/games/${gid}`, { method: 'POST', cookie: admin, body: { action: 'draw' } });
ok('re-draw returns same result (no second chance)', redraw.status === 200 && JSON.stringify(redraw.data.game.prizes) === JSON.stringify(g.prizes));
ok('completed game cannot be cancelled', (await call(`/api/admin/games/${gid}`, { method: 'POST', cookie: admin, body: { action: 'cancel' } })).status === 409);

console.log('Cancel & refund');
const g2 = (await mkGame(10)).data.game.id;
await call(`/api/games/${g2}/join`, { method: 'POST', cookie: users[0] });
await call(`/api/games/${g2}/join`, { method: 'POST', cookie: users[1] });
const before0 = await balance(users[0]);
const c1 = await call(`/api/admin/games/${g2}`, { method: 'POST', cookie: admin, body: { action: 'cancel', reason: 'test' } });
await call(`/api/admin/games/${g2}`, { method: 'POST', cookie: admin, body: { action: 'cancel', reason: 'again' } });
ok('cancel refunds every ticket exactly once', c1.status === 200 && (await balance(users[0])) === before0 + 5);
ok('cannot join a cancelled game', (await call(`/api/games/${g2}/join`, { method: 'POST', cookie: users[2] })).status === 409);

console.log('Under-filled game at end time');
const g3 = (await mkGame(10, { endTime: new Date(Date.now() + 4000).toISOString() })).data.game.id;
await call(`/api/games/${g3}/join`, { method: 'POST', cookie: users[2] });
const b2 = await balance(users[2]);
await new Promise((r) => setTimeout(r, 4500));
const g3d = (await call(`/api/games/${g3}`)).data.game;
ok('1 player for 2 prizes -> cancelled and refunded', g3d.status === 'cancelled' && (await balance(users[2])) === b2 + 5, g3d);

console.log('Withdrawals');
const bal1 = await balance(users[1]);
ok('cannot withdraw more than balance', (await call('/api/wallet/withdraw', { method: 'POST', cookie: users[1], body: { method: 'jazzcash', amount: 100000, accountName: 'P One', accountNumber: '03001234567' } })).status === 402);
await call('/api/admin/settings', { method: 'PUT', cookie: admin, body: { depositAccounts: [], minDeposit: 10, minWithdrawal: 10, announcement: '' } });
const w = await call('/api/wallet/withdraw', { method: 'POST', cookie: users[1], body: { method: 'jazzcash', amount: 20, accountName: 'P One', accountNumber: '03001234567' } });
ok('withdrawal holds the money', w.status === 201 && (await balance(users[1])) === bal1 - 20, w.data);
await call(`/api/admin/payments/${w.data.id}`, { method: 'POST', cookie: admin, body: { action: 'reject', note: 'wrong number' } });
ok('rejected withdrawal returns the money', (await balance(users[1])) === bal1);

console.log('Ledger');
for (const c of users) {
  const wal = (await call('/api/wallet', { cookie: c })).data;
  const latest = wal.history[0];
  assert.ok(!latest || latest.balance === wal.walletBalance, 'latest ledger row matches balance');
}
ok('every wallet matches its ledger', true);

console.log(`\n${passed} checks passed`);
