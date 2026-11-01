import Link from 'next/link';
import { adminStats } from '@/lib/admin';
import connectToDB from '@/lib/db';
import { rs, num } from '@/lib/format';
import SettleButton from './SettleButton';

export default async function AdminHome() {
  await connectToDB();
  const s = await adminStats();

  const needs = [
    { n: s.pendingDeposits, label: 'deposits to check', href: '/admin/payments?kind=deposit' },
    { n: s.pendingWithdrawals, label: 'withdrawals to send', href: '/admin/payments?kind=withdrawal' },
    { n: s.drawingGames, label: 'draws stuck in progress', href: '/admin/games?status=drawing' },
  ].filter((x) => x.n > 0);

  const cards = [
    ['Players', num(s.users), `+${num(s.newUsers)} today`],
    ['Open games', num(s.openGames), 'accepting tickets'],
    ['Tickets today', num(s.ticketsToday), 'last 24 hours'],
    ['Sales today', rs(s.salesToday), 'ticket money in'],
    ['Wallet float', rs(s.walletFloat), 'owed to players'],
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-jade">Overview</p>
          <h1 className="font-display text-3xl font-extrabold">Today at a glance</h1>
        </div>
        <div className="flex gap-2">
          <SettleButton />
          <Link href="/admin/games/new" className="btn-gold">New game</Link>
        </div>
      </div>

      {needs.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {needs.map((x) => (
            <Link key={x.label} href={x.href} className="card flex items-center gap-3 border-gold bg-gold-pale p-4 hover:shadow-ticket">
              <span className="font-display text-3xl font-extrabold text-forest">{x.n}</span>
              <span className="font-semibold text-forest">{x.label} →</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl bg-jade-light px-4 py-3 text-sm font-semibold text-jade">Nothing waiting on you. All payments are reviewed.</p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(([k, v, sub]) => (
          <div key={k} className="card p-5">
            <p className="text-sm font-semibold text-ink-soft">{k}</p>
            <p className="mt-1 whitespace-nowrap font-display text-3xl font-extrabold">{v}</p>
            <p className="text-xs text-ink-mute">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ['/admin/games', 'Games', 'Pause, draw early, cancel with refunds, see winners.'],
          ['/admin/prizes', 'Prize catalogue', 'Add phones, gadgets or cash prizes with photos.'],
          ['/admin/users', 'Players', 'Search, block, or correct a balance with a reason.'],
        ].map(([href, t, d]) => (
          <Link key={href} href={href} className="card p-5 transition hover:border-jade">
            <p className="font-display text-lg font-bold">{t}</p>
            <p className="mt-1 text-sm text-ink-soft">{d}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
