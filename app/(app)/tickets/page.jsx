import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { myTickets } from '@/lib/queries';
import { rs, ticketNo, dateTime } from '@/lib/format';
import Countdown from '@/components/Countdown';

export const metadata = { title: 'My tickets' };

function badge(t) {
  if (t.status === 'refunded') return ['Refunded', 'bg-coral-pale text-coral'];
  if (t.won) return [`Won ${t.won}`, 'bg-gold text-forest-deep'];
  if (t.game.status === 'completed') return ['Not this time', 'bg-paper text-ink-mute'];
  if (t.game.status === 'drawing') return ['Drawing…', 'bg-gold-pale text-gold-deep'];
  return ['In the draw', 'bg-jade-light text-jade'];
}

export default async function TicketsPage() {
  const user = await getSessionUser();
  const tickets = await myTickets(user);
  const live = tickets.filter((t) => t.game.status === 'active' || t.game.status === 'drawing');
  const past = tickets.filter((t) => !live.includes(t));

  const Row = ({ t }) => {
    const [label, cls] = badge(t);
    return (
      <Link href={`/play/${t.game.id}`} className="card flex items-center gap-4 p-3 pr-4 transition hover:border-jade">
        <div className="flex w-20 shrink-0 flex-col items-center justify-center self-stretch rounded-xl border-2 border-dashed border-line py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">No.</span>
          <span className="font-mono text-sm font-semibold">{ticketNo(t.ticketNo)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold leading-tight">{t.game.prizes[0]?.name || t.game.name}</p>
          <p className="truncate text-sm text-ink-soft">
            {t.game.name} · {rs(t.game.fee)} · {t.game.status === 'active' ? <Countdown to={t.game.endTime} /> : t.game.drawnAt ? dateTime(t.game.drawnAt) : 'closed'}
          </p>
        </div>
        <span className={`chip shrink-0 ${cls}`}>{label}</span>
      </Link>
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">My tickets</h1>
      {tickets.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-xl font-bold">No tickets yet</p>
          <p className="mt-1 text-ink-soft">Your tickets show up here the moment you join a game.</p>
          <Link href="/play" className="btn-gold mt-5">Find a game</Link>
        </div>
      ) : (
        <>
          <h2 className="eyebrow mt-8 text-ink-mute">Waiting for the draw ({live.length})</h2>
          <div className="mt-3 space-y-3">{live.length ? live.map((t) => <Row key={t.game.id} t={t} />) : <p className="text-sm text-ink-soft">None right now.</p>}</div>
          {past.length > 0 && (
            <>
              <h2 className="eyebrow mt-10 text-ink-mute">Finished</h2>
              <div className="mt-3 space-y-3">{past.map((t) => <Row key={t.game.id} t={t} />)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
