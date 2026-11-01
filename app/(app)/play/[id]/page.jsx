import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Progress } from '@/components/TicketCard';
import Countdown from '@/components/Countdown';
import JoinButton from '@/components/JoinButton';
import VerifyDraw from '@/components/VerifyDraw';
import { getSessionUser } from '@/lib/auth';
import { gameDetail } from '@/lib/queries';
import { rs, num, ticketNo, dateTime } from '@/lib/format';

export const metadata = { title: 'Game' };

const STATUS = {
  active: ['Open', 'bg-jade-light text-jade'],
  drawing: ['Drawing now', 'bg-gold-pale text-gold-deep'],
  completed: ['Winners picked', 'bg-forest text-gold'],
  cancelled: ['Cancelled · refunded', 'bg-coral-pale text-coral'],
};

export default async function GamePage({ params }) {
  const user = await getSessionUser();
  const data = await gameDetail(params.id, user);
  if (!data) notFound();
  const { game, myTicket } = data;
  const [statusLabel, statusClass] = STATUS[game.status] || STATUS.active;
  const open = game.status === 'active';
  const full = game.sold >= game.seats;
  const iWon = myTicket && game.prizes.some((p) => p.winners.some((w) => w.ticketNo === myTicket.ticketNo));

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/play" className="text-sm font-semibold text-jade hover:underline">← All games</Link>

      <section className="mt-4 overflow-hidden rounded-3xl bg-forest text-white guilloche">
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <span className={`chip ${statusClass}`}>{statusLabel}</span>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{game.name}</h1>
            {game.description && <p className="mt-2 max-w-xl text-white/70">{game.description}</p>}
            <div className="mt-5 max-w-md"><Progress sold={game.sold} seats={game.seats} dark /></div>
            <p className="mt-3 text-sm text-white/60">
              {open ? <>Closes <Countdown to={game.endTime} className="font-semibold text-white" /> · {dateTime(game.endTime)}</> : game.drawnAt ? `Drawn ${dateTime(game.drawnAt)}` : game.cancelReason}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 md:w-64">
            <p className="eyebrow text-gold">Ticket price</p>
            <p className="font-display text-5xl font-extrabold">{rs(game.fee)}</p>
            <div className="mt-4">
              {myTicket ? (
                <div className="rounded-xl border-2 border-dashed border-gold/60 p-3 text-center">
                  <p className="text-xs text-white/60">Your ticket</p>
                  <p className="font-mono text-2xl tracking-widest text-gold">No. {ticketNo(myTicket.ticketNo)}</p>
                  {myTicket.status === 'refunded' && <p className="mt-1 text-xs text-white/70">Refunded to your wallet</p>}
                </div>
              ) : open && !full && !game.paused ? (
                <JoinButton game={game} signedIn className="w-full" />
              ) : (
                <p className="rounded-xl bg-white/10 p-3 text-center text-sm text-white/70">{game.paused ? 'Paused for a moment' : open ? 'Sold out — draw starting' : 'Closed'}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {iWon && (
        <div className="mt-6 animate-rise rounded-2xl border-2 border-gold bg-gold-pale p-5 text-forest">
          <p className="font-display text-2xl font-extrabold">You won! 🎉</p>
          <p className="mt-1">Cash prizes are already in your wallet. For item prizes our team will call the number on your account to arrange delivery.</p>
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">Prizes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {game.prizes.map((p) => (
            <div key={p.id} className="card flex gap-4 p-4">
              <img src={p.image} alt="" className="h-24 w-24 shrink-0 rounded-xl bg-paper object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold leading-tight">{p.name}</p>
                <p className="text-sm text-ink-soft">{p.quantity} winner{p.quantity > 1 ? 's' : ''} · worth {rs(p.worth)}{p.type === 'cash' ? ' · paid to wallet' : ''}</p>
                {p.winners.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {p.winners.map((w) => (
                      <li key={w.ticketNo} className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm ${myTicket?.ticketNo === w.ticketNo ? 'bg-gold-pale font-bold' : 'bg-paper'}`}>
                        <span>{w.username}</span>
                        <span className="font-mono text-xs">#{ticketNo(w.ticketNo)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-xl font-bold">Rules for this game</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>• One ticket per person. {num(game.seats)} tickets in total.</li>
            <li>• The draw runs when all tickets are sold or at {dateTime(game.endTime)}, whichever comes first.</li>
            <li>• If fewer than {game.prizes.reduce((s, p) => s + p.quantity, 0)} people join by then, the game is cancelled and everyone is refunded.</li>
            <li>• Winners are picked by ticket number using the published fingerprint below.</li>
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-xl font-bold">Draw fingerprint</h2>
          <p className="mt-1 text-sm text-ink-soft">Published when the game opened. It can&apos;t be changed later.</p>
          <p className="mt-3 break-all rounded-lg bg-paper p-3 font-mono text-xs">{game.seedHash}</p>
          {game.seedRevealed ? (
            <VerifyDraw game={game} />
          ) : (
            <p className="mt-3 text-xs text-ink-mute">The secret behind this fingerprint is revealed right after the draw, so you can check the winners yourself.</p>
          )}
        </div>
      </section>
    </div>
  );
}
