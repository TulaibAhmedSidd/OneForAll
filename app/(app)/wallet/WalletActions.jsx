'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { LuPlus, LuArrowUpRight, LuCopy } from 'react-icons/lu';
import Sheet from '@/components/Sheet';
import { api } from '@/components/api';
import { rs, METHODS } from '@/lib/format';

const QUICK = [100, 250, 500, 1000];

export default function WalletActions({ settings, balance, openAdd }) {
  const router = useRouter();
  const [sheet, setSheet] = useState(openAdd ? 'add' : null);
  const [busy, setBusy] = useState(false);
  const accounts = settings.depositAccounts || [];
  const [dep, setDep] = useState({ method: accounts[0]?.method || 'easypaisa', amount: '', reference: '', accountNumber: '' });
  const [wd, setWd] = useState({ method: 'easypaisa', amount: '', accountName: '', accountNumber: '' });

  async function submit(kind) {
    setBusy(true);
    try {
      if (kind === 'add') await api('/api/wallet/deposit', { method: 'POST', body: dep });
      else await api('/api/wallet/withdraw', { method: 'POST', body: wd });
      toast.success(kind === 'add' ? 'Sent for checking. Your balance updates once it is confirmed.' : 'Withdrawal requested. We will send it after a quick check.');
      setSheet(null);
      router.refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  const copy = (text) => navigator.clipboard?.writeText(text).then(() => toast.info('Number copied'));
  const chosen = accounts.find((a) => a.method === dep.method);

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-sm">
        <button className="btn-gold" onClick={() => setSheet('add')}><LuPlus /> Add money</button>
        <button className="btn border border-white/25 text-white hover:bg-white/10" onClick={() => setSheet('withdraw')}><LuArrowUpRight /> Withdraw</button>
      </div>

      <Sheet open={sheet === 'add'} onClose={() => !busy && setSheet(null)} title="Add money">
        {accounts.length === 0 ? (
          <p className="rounded-xl bg-gold-pale p-4 text-sm text-forest">Adding money opens soon. The payment accounts haven&apos;t been set up yet.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); submit('add'); }} className="space-y-4">
            <div>
              <p className="label">1. Send money to</p>
              <div className="grid gap-2">
                {accounts.map((a) => (
                  <label key={a.method + a.number} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${dep.method === a.method ? 'border-jade bg-jade-light/40' : 'border-line'}`}>
                    <input type="radio" name="m" className="accent-[#1F7A5C]" checked={dep.method === a.method} onChange={() => setDep({ ...dep, method: a.method })} />
                    <span className="flex-1">
                      <span className="block font-semibold">{METHODS[a.method]}</span>
                      <span className="block text-sm text-ink-soft">{a.title} · <span className="font-mono">{a.number}</span></span>
                    </span>
                    <button type="button" onClick={() => copy(a.number)} className="rounded-lg p-2 text-jade hover:bg-jade-light" aria-label={`Copy ${METHODS[a.method]} number`}><LuCopy /></button>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="amt">2. Amount you sent</label>
              <input id="amt" type="number" inputMode="numeric" min={settings.minDeposit} className="field" required value={dep.amount} onChange={(e) => setDep({ ...dep, amount: e.target.value })} placeholder={`At least ${rs(settings.minDeposit)}`} />
              <div className="mt-2 flex gap-2">
                {QUICK.map((q) => <button type="button" key={q} onClick={() => setDep({ ...dep, amount: String(q) })} className="flex-1 rounded-lg border border-line py-1.5 text-sm font-semibold hover:border-jade">{q}</button>)}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="tid">3. Transaction ID (TID) from your SMS</label>
              <input id="tid" className="field font-mono uppercase" required minLength={4} value={dep.reference} onChange={(e) => setDep({ ...dep, reference: e.target.value })} placeholder="e.g. 0123456789" />
            </div>
            <div>
              <label className="label" htmlFor="from">Your {METHODS[dep.method]} number <span className="font-normal text-ink-mute">(optional)</span></label>
              <input id="from" type="tel" className="field" value={dep.accountNumber} onChange={(e) => setDep({ ...dep, accountNumber: e.target.value })} placeholder="03xx xxxxxxx" />
            </div>
            <button className="btn-gold w-full" disabled={busy}>{busy ? 'Sending…' : `I've sent ${dep.amount ? rs(dep.amount) : 'the money'}${chosen ? ` to ${METHODS[chosen.method]}` : ''}`}</button>
            <p className="text-center text-xs text-ink-mute">Usually checked within 30 minutes during the day. Each TID can be used once.</p>
          </form>
        )}
      </Sheet>

      <Sheet open={sheet === 'withdraw'} onClose={() => !busy && setSheet(null)} title="Withdraw">
        <form onSubmit={(e) => { e.preventDefault(); submit('withdraw'); }} className="space-y-4">
          <p className="rounded-xl bg-paper p-3 text-sm">Available: <b>{rs(balance)}</b> · minimum {rs(settings.minWithdrawal)}</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(METHODS).map(([k, v]) => (
              <button type="button" key={k} onClick={() => setWd({ ...wd, method: k })} className={`rounded-xl border p-3 text-sm font-semibold ${wd.method === k ? 'border-jade bg-jade-light/40 text-jade' : 'border-line'}`}>{v}</button>
            ))}
          </div>
          <div>
            <label className="label" htmlFor="wamt">Amount</label>
            <input id="wamt" type="number" inputMode="numeric" className="field" required min={settings.minWithdrawal} max={balance} value={wd.amount} onChange={(e) => setWd({ ...wd, amount: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="wname">Account holder name</label>
            <input id="wname" className="field" required value={wd.accountName} onChange={(e) => setWd({ ...wd, accountName: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="wnum">{wd.method === 'bank' ? 'IBAN / account number' : 'Mobile account number'}</label>
            <input id="wnum" className="field font-mono" required value={wd.accountNumber} onChange={(e) => setWd({ ...wd, accountNumber: e.target.value })} placeholder={wd.method === 'bank' ? 'PK00XXXX…' : '03xx xxxxxxx'} />
          </div>
          <button className="btn-forest w-full" disabled={busy || balance < settings.minWithdrawal}>{busy ? 'Sending…' : `Withdraw ${wd.amount ? rs(wd.amount) : ''}`}</button>
          <p className="text-center text-xs text-ink-mute">The amount is held from your balance now and returned if the request is rejected.</p>
        </form>
      </Sheet>
    </>
  );
}
