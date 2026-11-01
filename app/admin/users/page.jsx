'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '@/components/api';
import Sheet from '@/components/Sheet';
import { rs, dateTime } from '@/lib/format';

export default function UsersAdmin() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState(null);
  const [adjust, setAdjust] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = (term = q) => api(`/api/admin/users?q=${encodeURIComponent(term)}`).then((d) => setUsers(d.users)).catch((e) => toast.error(e.message));
  useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function patch(id, body, done) {
    setBusy(true);
    try {
      await api(`/api/admin/users/${id}`, { method: 'PATCH', body });
      toast.success(done);
      setAdjust(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-extrabold">Players</h1>
      <input className="field mt-5 max-w-md" placeholder="Search by name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />

      {users === null ? (
        <p className="mt-8 text-ink-soft">Loading…</p>
      ) : users.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-soft">No players found.</div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wider text-ink-mute">
              <tr><th className="p-3">Player</th><th className="p-3">Balance</th><th className="p-3">Played</th><th className="p-3">Won</th><th className="p-3">Joined</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id} className={u.isBlocked ? 'bg-coral-pale/50' : ''}>
                  <td className="p-3">
                    <p className="font-semibold">{u.username}{u.isAdmin && <span className="chip ml-2 bg-gold-pale text-gold-deep">Admin</span>}{u.isBlocked && <span className="chip ml-2 bg-coral-pale text-coral">Blocked</span>}</p>
                    <p className="text-ink-soft">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                  </td>
                  <td className="p-3 font-semibold">{rs(u.walletBalance)}</td>
                  <td className="p-3">{u.gamesPlayed}</td>
                  <td className="p-3">{u.prizesWon}</td>
                  <td className="p-3 text-ink-soft">{dateTime(u.createdAt)}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-ghost btn-sm" onClick={() => setAdjust({ user: u, amount: '', note: '' })}>Balance</button>
                      {!u.isAdmin && (
                        <button className="btn-sm btn border border-coral/40 text-coral hover:bg-coral-pale" disabled={busy} onClick={() => confirm(`${u.isBlocked ? 'Unblock' : 'Block'} ${u.username}?`) && patch(u.id, { isBlocked: !u.isBlocked }, u.isBlocked ? 'Unblocked' : 'Blocked')}>
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={!!adjust} onClose={() => !busy && setAdjust(null)} title="Correct balance">
        {adjust && (
          <form onSubmit={(e) => { e.preventDefault(); patch(adjust.user.id, { adjustAmount: Number(adjust.amount), adjustNote: adjust.note }, 'Balance updated'); }} className="space-y-4">
            <p className="rounded-xl bg-paper p-3 text-sm">{adjust.user.username} has <b>{rs(adjust.user.walletBalance)}</b>. Every change is recorded in their history with your email.</p>
            <div>
              <label className="label" htmlFor="adj">Amount (use minus to take away, e.g. -50)</label>
              <input id="adj" type="number" className="field" required value={adjust.amount} onChange={(e) => setAdjust({ ...adjust, amount: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="why">Reason</label>
              <input id="why" className="field" required maxLength={120} value={adjust.note} onChange={(e) => setAdjust({ ...adjust, note: e.target.value })} placeholder="e.g. Deposit TID 123 credited twice" />
            </div>
            <button className="btn-forest w-full" disabled={busy || !Number(adjust.amount)}>Apply {adjust.amount ? rs(adjust.amount) : ''}</button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
