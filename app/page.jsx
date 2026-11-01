import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TicketCard from '@/components/TicketCard';
import { getSessionUser } from '@/lib/auth';
import { openGames, recentResults, myTicketsMap } from '@/lib/queries';
import { rs, num } from '@/lib/format';

export const dynamic = 'force-dynamic';

const TIERS = [
  { fee: 1, line: 'Try your luck', note: 'Big pools, everyday prizes' },
  { fee: 5, line: 'The sweet spot', note: 'Fewer players, better odds' },
  { fee: 10, line: 'Bigger prizes', note: 'Phones, gadgets, cash' },
];

const STEPS = [
  ['Add money', 'Send Rs 50 or more from Easypaisa or JazzCash and enter the transaction ID. We add it to your wallet once it is checked.'],
  ['Pick a game', 'Every game shows its prizes, ticket price, how many tickets are left and when it closes.'],
  ['Buy one ticket', 'One tap. You get a numbered ticket. One ticket per person per game, so nobody can buy up the odds.'],
  ['The draw runs', 'As soon as the last ticket sells — or the timer ends — winners are picked from the ticket numbers.'],
  ['Collect', 'Cash prizes land in your wallet instantly. Item prizes are delivered to the phone number on your account.'],
];

const FAQ = [
  ['What happens if a game doesn’t fill up?', 'If time runs out and there are fewer players than prizes, the game is cancelled and every ticket is refunded to your wallet automatically.'],
  ['How do I know the draw isn’t rigged?', 'Before anyone buys a ticket we publish a fingerprint (hash) of a secret number. After the draw we reveal that number. Anyone can use it to re-run the draw and get the same winners — and we can’t change it after the fingerprint is out.'],
  ['How do I withdraw my winnings?', 'Open Wallet → Withdraw, choose Easypaisa, JazzCash or bank, and enter your number. The money is held straight away and sent after a quick check.'],
  ['Who can play?', 'Anyone 18 or older with a Pakistani mobile number. One account per person.'],
];

async function load(user) {
  try {
    const [open, recent] = await Promise.all([openGames(30), recentResults(6)]);
    const mine = await myTicketsMap(user, open.map((g) => g.id));
    return { open, recent, mine, ok: true };
  } catch (e) {
    console.error('[landing]', e);
    return { open: [], recent: [], mine: {}, ok: false };
  }
}

export default async function Landing() {
  const user = await getSessionUser().catch(() => null);
  const { open, recent, mine, ok } = await load(user);
  const featured = [...open].sort((a, b) => b.sold / b.seats - a.sold / a.seats)[0];
  const tierCount = (fee) => open.filter((g) => g.fee === fee).length;
  const totalPlayers = open.reduce((s, g) => s + g.sold, 0);
  const proof = recent.find((g) => g.seedRevealed);

  return (
    <>
      <SiteHeader user={user} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-forest text-white guilloche">
        <div className="wrap grid items-center gap-10 pb-16 pt-28 sm:pt-32 lg:grid-cols-[1.15fr_1fr] lg:pb-24">
          <div className="animate-rise">
            <p className="eyebrow text-gold">Live draws across Pakistan</p>
            <h1 className="mt-4 font-display text-[44px] font-extrabold leading-[.95] tracking-tight sm:text-6xl lg:text-7xl">
              Small ticket.
              <br />
              <span className="text-gold">Real prize.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/75">
              Buy a Rs 1, Rs 5 or Rs 10 ticket. The draw runs the moment the last ticket sells, and every result can be checked by anyone.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={user ? '/play' : '/register'} className="btn-gold text-base sm:px-8">
                {user ? 'Go to games' : 'Get my first ticket'}
              </Link>
              <Link href="#how" className="btn border border-white/25 text-white hover:bg-white/10">How it works</Link>
            </div>
            {open.length > 0 && (
              <p className="mt-6 text-sm text-white/60">
                <b className="text-white">{num(open.length)}</b> games open now · <b className="text-white">{num(totalPlayers)}</b> tickets sold
              </p>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="absolute -inset-6 rounded-[32px] bg-gold/10 blur-2xl" aria-hidden="true" />
            {featured ? (
              <div className="relative rotate-[-2deg] transition hover:rotate-0">
                <p className="eyebrow mb-3 text-center text-gold/90">Filling fastest right now</p>
                <TicketCard game={featured} myTicket={mine[featured.id]} signedIn={!!user} />
              </div>
            ) : (
              <div className="ticket relative rotate-[-2deg] p-6 text-ink">
                <p className="eyebrow text-jade">Coming up</p>
                <p className="mt-2 font-display text-2xl font-bold">New games open daily</p>
                <p className="mt-2 text-sm text-ink-soft">{ok ? 'Sign up now and we’ll have your wallet ready for the next draw.' : 'Games are loading slowly right now. Refresh in a minute.'}</p>
                <div className="ticket-perf" />
                <div className="ticket-stub flex items-center"><Link href="/register" className="btn-gold w-full">Create free account</Link></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ticket tiers */}
      <section className="wrap -mt-8 relative z-10">
        <div className="grid gap-3 sm:grid-cols-3">
          {TIERS.map((t) => (
            <Link key={t.fee} href={`/play?fee=${t.fee}`} className="card group flex items-center gap-4 p-4 shadow-ticket transition hover:-translate-y-0.5 hover:border-gold">
              <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gold-pale font-display text-forest">
                <span className="text-[10px] font-bold uppercase tracking-widest">Rs</span>
                <span className="text-3xl font-extrabold leading-none">{t.fee}</span>
              </span>
              <span className="flex-1">
                <span className="block font-display text-lg font-bold">{t.line}</span>
                <span className="block text-sm text-ink-soft">{t.note}</span>
              </span>
              <span className="chip bg-jade-light text-jade">{tierCount(t.fee)} live</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Live games */}
      <section id="games" className="wrap scroll-mt-20 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-jade">Open now</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">Pick a game</h2>
          </div>
          <Link href="/play" className="text-sm font-semibold text-jade hover:underline">See all →</Link>
        </div>
        {open.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {open.slice(0, 6).map((g) => <TicketCard key={g.id} game={g} myTicket={mine[g.id]} signedIn={!!user} />)}
          </div>
        ) : (
          <div className="card mt-8 p-10 text-center text-ink-soft">No games are open this minute. New ones are added every day — check back soon.</div>
        )}
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-y border-line bg-white py-16">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow text-jade">From wallet to winner</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">How a game works</h2>
            <p className="mt-4 max-w-sm text-ink-soft">Five steps, no surprises. The rules are the same for every game and every player.</p>
          </div>
          <ol className="space-y-3">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-line p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest font-mono text-sm font-semibold text-gold">{i + 1}</span>
                <div>
                  <p className="font-display text-lg font-bold">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Fairness */}
      <section className="bg-forest-deep py-16 text-white grain">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-gold">Checked, not trusted</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">The result is locked before you buy</h2>
            <p className="mt-4 text-white/70">
              Each game publishes a fingerprint of its secret draw number when it opens. After the draw, the number is revealed. If even one digit had changed, the fingerprint wouldn&apos;t match — so nobody, including us, can pick the winner.
            </p>
            <Link href="/fairness" className="btn mt-6 border border-white/25 text-white hover:bg-white/10">Check a draw yourself</Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 font-mono text-xs leading-relaxed">
            {proof ? (
              <>
                <p className="text-white/50">game</p>
                <p className="mb-3 text-white">{proof.name}</p>
                <p className="text-white/50">fingerprint published at start</p>
                <p className="mb-3 break-all text-gold">{proof.seedHash}</p>
                <p className="text-white/50">secret revealed after draw</p>
                <p className="mb-3 break-all text-white">{proof.seedRevealed}</p>
                <p className="text-white/50">winning tickets</p>
                <p className="text-white">{proof.prizes.flatMap((p) => p.winners.map((w) => `#${w.ticketNo}`)).join('  ')}</p>
              </>
            ) : (
              <p className="text-white/60">The first finished draw will appear here with its fingerprint and revealed secret.</p>
            )}
          </div>
        </div>
      </section>

      {/* Winners */}
      {recent.length > 0 && (
        <section className="wrap py-16">
          <p className="eyebrow text-jade">Latest draws</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">Recent winners</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((g) => (
              <Link href={`/play/${g.id}`} key={g.id} className="card flex items-center gap-3 p-3 transition hover:border-jade">
                <img src={g.prizes[0]?.image} alt="" className="h-14 w-14 rounded-lg bg-paper object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{g.prizes[0]?.name}</p>
                  <p className="truncate text-sm text-ink-soft">
                    {g.prizes[0]?.winners[0] ? `${g.prizes[0].winners[0].username} · ticket #${g.prizes[0].winners[0].ticketNo}` : g.name}
                  </p>
                </div>
                <span className="chip bg-gold-pale text-gold-deep">{rs(g.fee)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="border-t border-line bg-white py-16">
        <div className="wrap max-w-3xl">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Questions people ask</h2>
          <div className="mt-6 divide-y divide-line rounded-2xl border border-line">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q}
                  <span className="text-xl text-jade transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl bg-gold-pale p-8 text-center">
            <p className="font-display text-2xl font-bold text-forest">Your first ticket is one tap away</p>
            <Link href={user ? '/play' : '/register'} className="btn-forest px-8">{user ? 'Go to games' : 'Create free account'}</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
