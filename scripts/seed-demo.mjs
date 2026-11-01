// Creates demo prizes, games and a funded player through the API. Local use only.
//   BASE=http://localhost:3100 node scripts/seed-demo.mjs
const BASE = process.env.BASE || 'http://localhost:3000';
async function call(path, { method = 'GET', body, cookie } = {}) {
  const res = await fetch(BASE + path, { method, headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path}: ${data.error}`);
  return { data, cookie: res.headers.get('set-cookie')?.split(';')[0] };
}
async function session(email, name) {
  try { return (await call('/api/auth/login', { method: 'POST', body: { email, password: 'password123' } })).cookie; }
  catch { return (await call('/api/auth/register', { method: 'POST', body: { username: name, email, password: 'password123', phone: '03001234567', ageConfirmed: true } })).cookie; }
}
const admin = await session('admin@oneforall.test', 'Admin');
const player = await session('player@oneforall.test', 'Ayesha Khan');
await call('/api/admin/settings', { method: 'PUT', cookie: admin, body: { depositAccounts: [{ method: 'easypaisa', title: 'One For All', number: '03451234567' }, { method: 'jazzcash', title: 'One For All', number: '03001234567' }], minDeposit: 50, minWithdrawal: 200, announcement: '' } });
const prize = async (prizeName, img, prizeWorth, type = 'item') => (await call('/api/admin/prizes', { method: 'POST', cookie: admin, body: { prizeName, prizeImage: `${BASE}/demo/${img}.svg`, prizeWorth, type } })).data.id;
const phone = await prize('Samsung Galaxy A15', 'phone', 42000);
const buds = await prize('Wireless earbuds', 'earbuds', 4500);
const watch = await prize('Smart watch', 'watch', 9000);
const cash500 = await prize('Rs 500 cash', 'cash', 500, 'cash');
const cash5k = await prize('Rs 5,000 cash', 'cash', 5000, 'cash');
const day = 86400000, now = Date.now();
const game = (gameName, gameAmount, requiredUsers, hours, prizes, description = '') =>
  call('/api/admin/games', { method: 'POST', cookie: admin, body: { gameName, description, gameAmount, requiredUsers, startTime: new Date(now - 60000).toISOString(), endTime: new Date(now + hours * 3600000).toISOString(), prizes } });
const g1 = await game('Rs 1 Galaxy draw', 1, 60000, 70, [{ prizeId: phone, quantity: 1 }, { prizeId: cash500, quantity: 10 }], 'One phone and ten Rs 500 cash prizes.');
await game('Rs 5 earbuds rush', 5, 1500, 20, [{ prizeId: buds, quantity: 2 }, { prizeId: cash500, quantity: 5 }]);
await game('Rs 10 smart watch', 10, 1200, 2, [{ prizeId: watch, quantity: 1 }, { prizeId: cash5k, quantity: 1 }]);
await game('Rs 5 cash Friday', 5, 800, 46, [{ prizeId: cash5k, quantity: 1 }, { prizeId: cash500, quantity: 4 }]);
const dep = await call('/api/wallet/deposit', { method: 'POST', cookie: player, body: { method: 'easypaisa', amount: 250, reference: `DEMO${now}` } });
await call(`/api/admin/payments/${dep.data.id}`, { method: 'POST', cookie: admin, body: { action: 'approve' } });
await call(`/api/games/${g1.data.game.id}/join`, { method: 'POST', cookie: player });
await call('/api/wallet/deposit', { method: 'POST', cookie: player, body: { method: 'jazzcash', amount: 500, reference: `DEMO2${now}` } });
console.log('Seeded. Log in as admin@oneforall.test or player@oneforall.test (password123).');
