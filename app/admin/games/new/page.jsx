'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { LuTrash2 } from 'react-icons/lu';
import { api } from '@/components/api';
import { rs } from '@/lib/format';

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time.
const local = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const PRESETS = [
  { fee: 1, seats: 10000 },
  { fee: 5, seats: 2000 },
  { fee: 10, seats: 1000 },
];

export default function NewGame() {
  const router = useRouter();
  const [catalogue, setCatalogue] = useState([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(() => ({
    gameName: '',
    description: '',
    gameAmount: 5,
    requiredUsers: 2000,
    startTime: local(new Date()),
    endTime: local(new Date(Date.now() + 3 * 86400000)),
  }));
  const [prizes, setPrizes] = useState([{ prizeId: '', quantity: 1 }]);

  useEffect(() => {
    api('/api/admin/prizes').then((d) => setCatalogue(d.prizes)).catch((e) => toast.error(e.message));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const prizeCost = useMemo(
    () => prizes.reduce((s, p) => s + (catalogue.find((c) => c.id === p.prizeId)?.worth || 0) * Number(p.quantity || 0), 0),
    [prizes, catalogue]
  );
  const revenue = Number(form.gameAmount || 0) * Number(form.requiredUsers || 0);
  const margin = revenue - prizeCost;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/admin/games', {
        method: 'POST',
        body: {
          ...form,
          gameAmount: Number(form.gameAmount),
          requiredUsers: Number(form.requiredUsers),
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          prizes: prizes.map((p) => ({ prizeId: p.prizeId, quantity: Number(p.quantity) })),
        },
      });
      toast.success('Game is live');
      router.push('/admin/games');
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/games" className="text-sm font-semibold text-jade hover:underline">← Games</Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold">New game</h1>

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <div>
              <label className="label" htmlFor="name">Game name</label>
              <input id="name" className="field" required minLength={3} value={form.gameName} onChange={set('gameName')} placeholder="Rs 5 Galaxy A15 draw" />
            </div>
            <div>
              <label className="label" htmlFor="desc">Short description <span className="font-normal text-ink-mute">(optional)</span></label>
              <textarea id="desc" className="field min-h-[90px] py-3" maxLength={500} value={form.description} onChange={set('description')} />
            </div>
          </section>

          <section className="card space-y-4 p-5">
            <p className="font-display text-lg font-bold">Ticket price &amp; size</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button type="button" key={p.fee} onClick={() => setForm((f) => ({ ...f, gameAmount: p.fee, requiredUsers: p.seats }))} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${Number(form.gameAmount) === p.fee ? 'border-jade bg-jade-light text-jade' : 'border-line'}`}>
                  {rs(p.fee)} · {p.seats.toLocaleString()} tickets
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="fee">Ticket price (Rs)</label>
                <input id="fee" type="number" min={1} step={1} className="field" required value={form.gameAmount} onChange={set('gameAmount')} />
              </div>
              <div>
                <label className="label" htmlFor="seats">Total tickets</label>
                <input id="seats" type="number" min={1} step={1} className="field" required value={form.requiredUsers} onChange={set('requiredUsers')} />
              </div>
              <div>
                <label className="label" htmlFor="start">Opens</label>
                <input id="start" type="datetime-local" className="field" required value={form.startTime} onChange={set('startTime')} />
              </div>
              <div>
                <label className="label" htmlFor="end">Closes (draw at the latest)</label>
                <input id="end" type="datetime-local" className="field" required value={form.endTime} onChange={set('endTime')} />
              </div>
            </div>
          </section>

          <section className="card space-y-3 p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold">Prizes</p>
              <Link href="/admin/prizes" className="text-sm font-semibold text-jade hover:underline">Manage catalogue</Link>
            </div>
            {catalogue.length === 0 && <p className="rounded-xl bg-gold-pale p-3 text-sm text-forest">Add a prize to the catalogue first.</p>}
            {prizes.map((p, i) => (
              <div key={i} className="flex gap-2">
                <select className="field flex-1" required value={p.prizeId} onChange={(e) => setPrizes(prizes.map((x, j) => (j === i ? { ...x, prizeId: e.target.value } : x)))}>
                  <option value="">Choose a prize…</option>
                  {catalogue.map((c) => <option key={c.id} value={c.id}>{c.name} — {rs(c.worth)}{c.type === 'cash' ? ' (cash)' : ''}</option>)}
                </select>
                <input type="number" min={1} className="field w-24" aria-label="Quantity" value={p.quantity} onChange={(e) => setPrizes(prizes.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))} />
                {prizes.length > 1 && (
                  <button type="button" onClick={() => setPrizes(prizes.filter((_, j) => j !== i))} className="rounded-xl px-3 text-coral hover:bg-coral-pale" aria-label="Remove prize"><LuTrash2 /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setPrizes([...prizes, { prizeId: '', quantity: 1 }])} className="btn-ghost btn-sm">+ Add another prize</button>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="card space-y-3 p-5">
            <p className="font-display text-lg font-bold">If every ticket sells</p>
            <div className="flex justify-between text-sm"><span className="text-ink-soft">Ticket money</span><b>{rs(revenue)}</b></div>
            <div className="flex justify-between text-sm"><span className="text-ink-soft">Prize cost</span><b>− {rs(prizeCost)}</b></div>
            <div className="flex justify-between border-t border-line pt-3"><span className="font-semibold">Margin</span><b className={margin < 0 ? 'text-coral' : 'text-jade'}>{rs(margin)}</b></div>
            {margin < 0 && <p className="rounded-lg bg-coral-pale p-2.5 text-xs text-coral">Prizes cost more than a full game brings in.</p>}
            <p className="text-xs text-ink-mute">Fee, ticket count and prizes are locked once the game is live, so nobody&apos;s paid ticket changes.</p>
            <button className="btn-gold w-full" disabled={busy || !catalogue.length}>{busy ? 'Publishing…' : 'Publish game'}</button>
          </div>
        </aside>
      </form>
    </div>
  );
}
