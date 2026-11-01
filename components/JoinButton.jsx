'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { api } from './api';
import { rs, ticketNo } from '@/lib/format';
import { LogoMark } from './Logo';

// One big button. Tapping it opens a short confirmation sheet; confirming buys the ticket
// and shows it "stamped" with the ticket number.
export default function JoinButton({ game, signedIn, className = '' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function start() {
    if (!signedIn) return router.push(`/login?next=/play/${game.id}`);
    setTicket(null);
    setOpen(true);
  }

  // Refresh after the sheet closes: refreshing earlier swaps this button for the ticket badge
  // and the success sheet would disappear before the player sees it.
  function close() {
    setOpen(false);
    if (ticket) router.refresh();
  }

  async function confirm() {
    setBusy(true);
    try {
      const r = await api(`/api/games/${game.id}/join`, { method: 'POST' });
      setTicket(r);
    } catch (e) {
      if (/balance/i.test(e.message)) {
        setOpen(false);
        toast.info('Add money to your wallet to buy this ticket.');
        router.push('/wallet?add=1');
      } else toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={start} className={`btn-gold ${className}`}>
        Join for {rs(game.fee)}
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest-deep/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Buy ticket" onClick={() => !busy && close()}>
          <div className="w-full max-w-md animate-rise rounded-t-3xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            {ticket ? (
              <div className="text-center">
                <div className="relative mx-auto mb-5 w-full max-w-xs overflow-hidden rounded-2xl bg-forest p-5 text-left text-white guilloche">
                  <p className="eyebrow text-gold">Your ticket</p>
                  <p className="mt-1 font-display text-lg font-bold">{game.name}</p>
                  <p className="mt-4 font-mono text-3xl tracking-widest text-gold">No. {ticketNo(ticket.ticketNo)}</p>
                  <span className="absolute right-4 top-4 animate-stamp rounded-md border-2 border-gold px-2 py-0.5 font-display text-sm font-extrabold uppercase text-gold">Paid</span>
                </div>
                <h2 className="font-display text-2xl font-bold">You&apos;re in the draw</h2>
                <p className="mt-1 text-ink-soft">New balance {rs(ticket.walletBalance)}. We&apos;ll show the winners here as soon as all tickets are sold or time runs out.</p>
                <button className="btn-forest mt-6 w-full" onClick={close}>Done</button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <LogoMark className="h-10 w-10" />
                  <div>
                    <p className="eyebrow text-ink-mute">Buy one ticket</p>
                    <h2 className="font-display text-xl font-bold leading-tight">{game.name}</h2>
                  </div>
                </div>
                <dl className="mt-5 divide-y divide-line rounded-2xl border border-line text-sm">
                  <div className="flex justify-between p-3.5"><dt className="text-ink-soft">Ticket price</dt><dd className="font-semibold">{rs(game.fee)}</dd></div>
                  <div className="flex justify-between p-3.5"><dt className="text-ink-soft">Prizes</dt><dd className="text-right font-semibold">{game.prizes.map((p) => `${p.quantity}× ${p.name}`).join(', ')}</dd></div>
                  <div className="flex justify-between p-3.5"><dt className="text-ink-soft">Tickets left</dt><dd className="font-semibold">{(game.seats - game.sold).toLocaleString()}</dd></div>
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-ink-mute">The ticket price is taken from your wallet. If the game is cancelled or doesn&apos;t get enough players, you get it back automatically.</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button className="btn-ghost" onClick={() => setOpen(false)} disabled={busy}>Not now</button>
                  <button className="btn-gold" onClick={confirm} disabled={busy}>{busy ? 'Buying…' : `Pay ${rs(game.fee)}`}</button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
