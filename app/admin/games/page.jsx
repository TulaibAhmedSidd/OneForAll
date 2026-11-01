'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { api } from '@/components/api';
import Sheet from '@/components/Sheet';
import { Progress } from '@/components/TicketCard';
import { rs, dateTime, ticketNo } from '@/lib/format';

const TABS = [
  ['active', 'Open'],
  ['drawing', 'Drawing'],
  ['completed', 'Finished'],
  ['cancelled', 'Cancelled'],
];

function GamesAdmin() {
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get('status') || 'active');
  const [games, setGames] = useState(null);
  const [winners, setWinners] = useState(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setGames(null);
    try {
      setGames((await api(`/api/admin/games?status=${status}`)).games);
    } catch (e) {
      toast.error(e.message);
      setGames([]);
    }
  }, [status]);
  useEffect(() => { load(); }, [load]);

  async function act(game, action, extra = {}) {
    const confirmText = {
      draw: `Draw winners for "${game.name}" now with ${game.sold} tickets sold?`,
      cancel: `Cancel "${game.name}" and refund all ${game.sold} tickets?`,
    }[action];
    if (confirmText && !confirm(confirmText)) return;
    setBusy(game.id + action);
    try {
      if (action === 'pause') await api(`/api/admin/games/${game.id}`, { method: 'PATCH', body: { paused: !game.paused } });
      else {
        const r = await api(`/api/admin/games/${game.id}`, { method: 'POST', body: { action, ...extra } });
        if (r.refundsPending) toast.info('Some refunds are still running. Press Cancel again to finish them.');
      }
      toast.success({ pause: game.paused ? 'Game resumed' : 'Game paused', draw: 'Winners drawn', cancel: 'Game cancelled and refunded' }[action]);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy('');
    }
  }

  async function showWinners(game) {
    try {
      setWinners({ game, ...(await api(`/api/admin/games/${game.id}/winners`)) });
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function deliver(prizeId, t) {
    try {
      await api(`/api/admin/games/${winners.game.id}`, { method: 'POST', body: { action: 'deliver', prizeId, ticketNo: t } });
      showWinners(winners.game);
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold">Games</h1>
        <Link href="/admin/games/new" className="btn-gold">New game</Link>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setStatus(k)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${status === k ? 'border-forest bg-forest text-white' : 'border-line bg-white'}`}>{l}</button>
        ))}
      </div>

      {games === null ? (
        <p className="mt-8 text-ink-soft">Loading…</p>
      ) : games.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-soft">No {TABS.find((t) => t[0] === status)[1].toLowerCase()} games.</div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {games.map((g) => {
            const take = g.fee * g.sold;
            return (
              <div key={g.id} className="card p-5">
                <div className="flex gap-4">
                  <img src={g.prizes[0]?.image} alt="" className="h-16 w-16 rounded-xl bg-paper object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-bold leading-tight">{g.name}{g.paused && <span className="chip ml-2 bg-gold-pale text-gold-deep">Paused</span>}</p>
                    <p className="text-sm text-ink-soft">{rs(g.fee)} ticket · {g.prizes.map((p) => `${p.quantity}× ${p.name}`).join(', ')}</p>
                    <p className="text-xs text-ink-mute">Ends {dateTime(g.endTime)}</p>
                  </div>
                </div>
                <div className="mt-4"><Progress sold={g.sold} seats={g.seats} /></div>
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-paper p-3 text-center text-sm">
                  <div><p className="text-xs text-ink-mute">Collected</p><p className="font-bold">{rs(take)}</p></div>
                  <div><p className="text-xs text-ink-mute">Prize cost</p><p className="font-bold">{rs(g.prizeWorth)}</p></div>
                  <div><p className="text-xs text-ink-mute">If full</p><p className={`font-bold ${g.fee * g.seats - g.prizeWorth < 0 ? 'text-coral' : 'text-jade'}`}>{rs(g.fee * g.seats - g.prizeWorth)}</p></div>
                </div>
                {g.cancelReason && <p className="mt-3 text-sm text-coral">{g.cancelReason}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {g.status === 'active' && (
                    <>
                      <button className="btn-ghost btn-sm" disabled={!!busy} onClick={() => act(g, 'pause')}>{g.paused ? 'Resume' : 'Pause'}</button>
                      <button className="btn-forest btn-sm" disabled={!!busy} onClick={() => act(g, 'draw')}>Draw now</button>
                    </>
                  )}
                  {g.status === 'drawing' && <button className="btn-forest btn-sm" disabled={!!busy} onClick={() => act(g, 'draw')}>Retry draw</button>}
                  {(g.status === 'active' || g.status === 'drawing' || (g.status === 'cancelled')) && (
                    <button className="btn-sm btn border border-coral/40 text-coral hover:bg-coral-pale" disabled={!!busy} onClick={() => act(g, 'cancel', { reason: 'Cancelled by admin. Your ticket was refunded.' })}>
                      {g.status === 'cancelled' ? 'Finish refunds' : 'Cancel & refund'}
                    </button>
                  )}
                  {g.status === 'completed' && <button className="btn-forest btn-sm" onClick={() => showWinners(g)}>Winners &amp; delivery</button>}
                  <Link href={`/play/${g.id}`} className="btn-ghost btn-sm">Public page</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={!!winners} onClose={() => setWinners(null)} title="Winners" wide>
        {winners?.prizes.map((p) => (
          <div key={p.id} className="mb-5">
            <p className="font-display text-lg font-bold">{p.name} <span className="text-sm font-normal text-ink-mute">({p.type})</span></p>
            <div className="mt-2 divide-y divide-line rounded-xl border border-line">
              {p.winners.map((w) => (
                <div key={w.ticketNo} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                  <div>
                    <p className="font-semibold">{w.username} · <span className="font-mono">#{ticketNo(w.ticketNo)}</span></p>
                    <p className="text-ink-soft">{w.phone || 'no phone'} · {w.email}</p>
                  </div>
                  {w.delivered ? <span className="chip bg-jade-light text-jade">{p.type === 'cash' ? 'Paid to wallet' : 'Delivered'}</span> : <button className="btn-gold btn-sm" onClick={() => deliver(p.id, w.ticketNo)}>Mark delivered</button>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Sheet>
    </div>
  );
}

export default function Page() {
  return <Suspense><GamesAdmin /></Suspense>;
}
