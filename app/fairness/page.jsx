import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: 'How draws are checked' };
export const dynamic = 'force-dynamic';

const STEPS = [
  ['Before the game opens', 'We generate a long random secret and publish only its SHA-256 fingerprint on the game page. A fingerprint can be checked against a secret, but the secret can’t be worked out from it.'],
  ['While tickets sell', 'Tickets are numbered 1, 2, 3… in the order people join. One ticket per person.'],
  ['The draw', 'Winning ticket number k is HMAC-SHA256(secret, "gameId:k"), turned into a number between 1 and the tickets sold. Repeats are skipped. Prizes are given in the order listed on the game.'],
  ['After the draw', 'We reveal the secret. If it matches the fingerprint published at the start, the result was fixed before anyone bought a ticket — nobody could change it.'],
];

export default async function Fairness() {
  const user = await getSessionUser().catch(() => null);
  return (
    <>
      <SiteHeader user={user} />
      <section className="bg-forest pb-14 pt-28 text-white guilloche sm:pt-32">
        <div className="wrap max-w-3xl">
          <p className="eyebrow text-gold">Fair draws</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">Don&apos;t trust us. Check us.</h1>
          <p className="mt-4 text-lg text-white/75">Every finished game has a “Check this draw on my phone” button. It repeats the draw in your browser using the same steps below.</p>
        </div>
      </section>
      <main className="wrap max-w-3xl py-14">
        <ol className="space-y-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="card flex gap-4 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest font-mono text-sm font-semibold text-gold">{i + 1}</span>
              <div>
                <h2 className="font-display text-xl font-bold">{t}</h2>
                <p className="mt-1 leading-relaxed text-ink-soft">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="card mt-8 p-5">
          <h2 className="font-display text-xl font-bold">Check it with your own code</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-forest-deep p-4 font-mono text-xs leading-relaxed text-white">{`const crypto = require('crypto');
// copy these from the game page
const secret = '…', gameId = '…', sold = 1000, prizes = 3;
const n = BigInt(sold), limit = (1n << 256n) - ((1n << 256n) % n);
const won = [];
for (let k = 0; won.length < prizes; k++) {
  const v = BigInt('0x' + crypto.createHmac('sha256', secret).update(gameId + ':' + k).digest('hex'));
  if (v >= limit) continue;
  const t = Number(v % n) + 1;
  if (!won.includes(t)) won.push(t);
}
console.log(won); // winning ticket numbers, in prize order`}</pre>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
