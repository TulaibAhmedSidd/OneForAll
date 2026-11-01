import Link from 'next/link';
import TicketCard from '@/components/TicketCard';
import { getSessionUser } from '@/lib/auth';
import { openGames, myTicketsMap } from '@/lib/queries';
import { rs } from '@/lib/format';

export const metadata = { title: 'Games' };

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: '1', label: 'Rs 1' },
  { key: '5', label: 'Rs 5' },
  { key: '10', label: 'Rs 10' },
  { key: 'more', label: 'Rs 20+' },
];

export default async function PlayPage({ searchParams }) {
  const user = await getSessionUser();
  const games = await openGames(90);
  const mine = await myTicketsMap(user, games.map((g) => g.id));
  const fee = searchParams?.fee || 'all';

  const shown = games.filter((g) => {
    if (fee === 'all') return true;
    if (fee === 'more') return g.fee > 10;
    return g.fee === Number(fee);
  });
  const joined = games.filter((g) => mine[g.id]).length;

  return (
    <div>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-jade">Salaam, {user.username.split(' ')[0]}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">Pick your next ticket</h1>
          <p className="mt-1 text-ink-soft">
            {games.length} games open{joined ? ` · you're in ${joined}` : ''}
          </p>
        </div>
        {user.walletBalance < 10 && (
          <Link href="/wallet?add=1" className="card flex items-center gap-3 border-gold bg-gold-pale p-3 pr-4 text-sm">
            <span className="font-display text-lg font-bold text-forest">{rs(user.walletBalance)}</span>
            <span className="text-forest">Add money to play →</span>
          </Link>
        )}
      </section>

      <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Filter by ticket price">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/play' : `/play?fee=${f.key}`}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${fee === f.key ? 'border-forest bg-forest text-white' : 'border-line bg-white text-ink-soft hover:border-jade'}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {shown.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((g) => <TicketCard key={g.id} game={g} myTicket={mine[g.id]} signedIn />)}
        </div>
      ) : (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-xl font-bold">No games at this price right now</p>
          <p className="mt-1 text-ink-soft">New games open every day. Try another price.</p>
          <Link href="/play" className="btn-ghost mt-5">Show all games</Link>
        </div>
      )}
    </div>
  );
}
