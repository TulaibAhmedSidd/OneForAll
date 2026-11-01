'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { api } from '@/components/api';
import { rs, dateTime, METHODS } from '@/lib/format';

function Payments() {
  const params = useSearchParams();
  const [kind, setKind] = useState(params.get('kind') === 'withdrawal' ? 'withdrawal' : 'deposit');
  const [status, setStatus] = useState('pending');
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setRows(null);
    try {
      setRows((await api(`/api/admin/payments?kind=${kind}&status=${status}`)).requests);
    } catch (e) {
      toast.error(e.message);
      setRows([]);
    }
  }, [kind, status]);
  useEffect(() => { load(); }, [load]);

  async function review(r, action) {
    let note = '';
    if (action === 'reject') {
      note = prompt('Reason shown to the player (e.g. "TID not found"):', kind === 'deposit' ? 'Transaction ID not found in our account' : '') ?? null;
      if (note === null) return;
    } else if (!confirm(kind === 'deposit' ? `Add ${rs(r.amount)} to ${r.username}'s wallet? Only approve after you see TID ${r.reference} in the ${METHODS[r.method]} account.` : `Mark ${rs(r.amount)} as sent to ${r.accountName} (${r.accountNumber})?`)) return;
    setBusy(r.id);
    try {
      await api(`/api/admin/payments/${r.id}`, { method: 'POST', body: { action, note } });
      toast.success(action === 'approve' ? 'Approved' : 'Rejected');
      setRows((list) => list.filter((x) => x.id !== r.id));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-extrabold">Payments</h1>
      <p className="text-ink-soft">{kind === 'deposit' ? 'Match each transaction ID against your Easypaisa / JazzCash statement before approving.' : 'Send the money first, then mark the request as approved. Rejecting returns the money to the player.'}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[['deposit', 'Deposits'], ['withdrawal', 'Withdrawals']].map(([k, l]) => (
          <button key={k} onClick={() => setKind(k)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${kind === k ? 'border-forest bg-forest text-white' : 'border-line bg-white'}`}>{l}</button>
        ))}
        <span className="mx-1 w-px bg-line" />
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize ${status === s ? 'border-jade bg-jade-light text-jade' : 'border-line bg-white'}`}>{s}</button>
        ))}
      </div>

      {rows === null ? (
        <p className="mt-8 text-ink-soft">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-soft">Nothing {status} here.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="w-28">
                <p className="font-display text-2xl font-extrabold">{rs(r.amount)}</p>
                <p className="text-xs text-ink-mute">{METHODS[r.method]}</p>
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">{r.username}</p>
                {r.kind === 'deposit' ? (
                  <p className="text-ink-soft">TID <span className="font-mono font-semibold text-ink">{r.reference}</span>{r.accountNumber ? ` · from ${r.accountNumber}` : ''}</p>
                ) : (
                  <p className="text-ink-soft">Send to <b className="text-ink">{r.accountName}</b> · <span className="font-mono">{r.accountNumber}</span></p>
                )}
                <p className="text-xs text-ink-mute">{dateTime(r.at)}{r.note ? ` · ${r.note}` : ''}</p>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button className="btn-sm btn border border-coral/40 text-coral hover:bg-coral-pale" disabled={busy === r.id} onClick={() => review(r, 'reject')}>Reject</button>
                  <button className="btn-forest btn-sm" disabled={busy === r.id} onClick={() => review(r, 'approve')}>{r.kind === 'deposit' ? 'Approve & credit' : 'Mark as sent'}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return <Suspense><Payments /></Suspense>;
}
