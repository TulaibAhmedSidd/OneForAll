import Link from 'next/link';
import Countdown from './Countdown';
import JoinButton from './JoinButton';
import { rs, num, ticketNo } from '@/lib/format';

export function Progress({ sold, seats, dark = false }) {
  const pct = Math.min(100, Math.round((sold / Math.max(1, seats)) * 100));
  return (
    <div>
      <div className={`h-2 overflow-hidden rounded-full ${dark ? 'bg-white/15' : 'bg-jade-light'}`}>
        <div className="h-full rounded-full bg-gradient-to-r from-jade to-gold transition-[width] duration-700" style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <div className={`mt-1.5 flex justify-between text-xs font-medium ${dark ? 'text-white/70' : 'text-ink-mute'}`}>
        <span>
          <b className={dark ? 'text-white' : 'text-ink'}>{num(sold)}</b> of {num(seats)} tickets sold
        </span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

// A game shown as a tear-off ticket: prize on top, entry fee and one button on the stub.
export default function TicketCard({ game, myTicket = null, signedIn = false }) {
  const lead = game.prizes[0];
  const extra = game.prizes.reduce((s, p) => s + p.quantity, 0) - (lead?.quantity || 0);
  const href = `/play/${game.id}`;
  const full = game.sold >= game.seats;

  return (
    <article className="ticket group flex flex-col transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link href={href} className="flex flex-1 flex-col p-4 pb-5 focus-visible:outline-none" aria-label={`${game.name}: open details`}>
        <div className="flex items-start gap-3.5">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-paper">
            {lead?.image && <img src={lead.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-jade">Win</p>
            <h3 className="font-display text-xl font-bold leading-tight text-ink line-clamp-2">
              {lead?.quantity > 1 && <span className="text-gold-deep">{lead.quantity}× </span>}
              {lead?.name || game.name}
            </h3>
            {extra > 0 && <p className="mt-1 text-sm text-ink-soft">+ {extra} more prize{extra > 1 ? 's' : ''}</p>}
            <p className="mt-1 text-xs text-ink-mute">Worth {rs(game.prizeWorth)}</p>
          </div>
        </div>
        <div className="mt-4">
          <Progress sold={game.sold} seats={game.seats} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-ink-soft">
          <span className="truncate pr-2">{game.name}</span>
          <Countdown to={game.endTime} className="shrink-0" />
        </div>
      </Link>

      <div className="ticket-perf" aria-hidden="true" />

      <div className="ticket-stub flex items-center gap-3 px-4">
        <div className="shrink-0">
          <p className="eyebrow text-ink-mute">Ticket</p>
          <p className="font-display text-3xl font-extrabold leading-none text-forest">{rs(game.fee)}</p>
        </div>
        <div className="flex-1">
          {myTicket ? (
            <Link href={href} className="btn w-full border-2 border-dashed border-jade/40 bg-jade-light/50 font-mono text-jade">
              No. {ticketNo(myTicket)}
            </Link>
          ) : game.paused ? (
            <span className="btn w-full bg-paper text-ink-mute">Paused</span>
          ) : full ? (
            <span className="btn w-full bg-paper text-ink-mute">Sold out</span>
          ) : (
            <JoinButton game={game} signedIn={signedIn} className="w-full" />
          )}
        </div>
      </div>
    </article>
  );
}
