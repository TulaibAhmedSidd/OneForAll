'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { LuTrash2 } from 'react-icons/lu';
import { api } from '@/components/api';
import { METHODS } from '@/lib/format';

export default function SettingsAdmin() {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/settings').then(setS).catch((e) => toast.error(e.message));
  }, []);

  const setAcc = (i, k, v) => setS({ ...s, depositAccounts: s.depositAccounts.map((a, j) => (j === i ? { ...a, [k]: v } : a)) });

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/admin/settings', { method: 'PUT', body: { ...s, minDeposit: Number(s.minDeposit), minWithdrawal: Number(s.minWithdrawal) } });
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!s) return <p className="text-ink-soft">Loading…</p>;

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-extrabold">Settings</h1>

      <section className="card space-y-3 p-5">
        <p className="font-display text-lg font-bold">Where players send money</p>
        <p className="text-sm text-ink-soft">Shown on the Add money screen. Use accounts you check every day.</p>
        {s.depositAccounts.map((a, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[140px_1fr_1fr_auto]">
            <select className="field" value={a.method} onChange={(e) => setAcc(i, 'method', e.target.value)}>
              {Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className="field" placeholder="Account title" required value={a.title} onChange={(e) => setAcc(i, 'title', e.target.value)} />
            <input className="field font-mono" placeholder="Number / IBAN" required value={a.number} onChange={(e) => setAcc(i, 'number', e.target.value)} />
            <button type="button" onClick={() => setS({ ...s, depositAccounts: s.depositAccounts.filter((_, j) => j !== i) })} className="rounded-xl px-3 text-coral hover:bg-coral-pale" aria-label="Remove account"><LuTrash2 /></button>
          </div>
        ))}
        {s.depositAccounts.length < 6 && (
          <button type="button" className="btn-ghost btn-sm" onClick={() => setS({ ...s, depositAccounts: [...s.depositAccounts, { method: 'easypaisa', title: '', number: '' }] })}>+ Add account</button>
        )}
      </section>

      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="mind">Minimum deposit (Rs)</label>
          <input id="mind" type="number" min={1} className="field" value={s.minDeposit} onChange={(e) => setS({ ...s, minDeposit: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="minw">Minimum withdrawal (Rs)</label>
          <input id="minw" type="number" min={1} className="field" value={s.minWithdrawal} onChange={(e) => setS({ ...s, minWithdrawal: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="ann">Announcement bar <span className="font-normal text-ink-mute">(shown to every player, leave empty to hide)</span></label>
          <input id="ann" className="field" maxLength={200} value={s.announcement} onChange={(e) => setS({ ...s, announcement: e.target.value })} placeholder="Eid special: Rs 10 iPhone draw closes Friday" />
        </div>
      </section>

      <button className="btn-gold w-full sm:w-auto sm:px-10" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}
