import { getSessionUser } from '@/lib/auth';
import { walletData } from '@/lib/queries';
import { rs, dateTime, METHODS } from '@/lib/format';
import WalletActions from './WalletActions';

export const metadata = { title: 'Wallet' };

const TYPE = {
  'top-up': 'Money added',
  'game-participation': 'Ticket bought',
  'game-win': 'Prize won',
  refund: 'Refund',
  withdrawal: 'Withdrawal',
  'withdrawal-reversal': 'Withdrawal returned',
  adjustment: 'Adjustment',
};
const REQ = { pending: 'bg-gold-pale text-gold-deep', approved: 'bg-jade-light text-jade', rejected: 'bg-coral-pale text-coral' };

export default async function WalletPage({ searchParams }) {
  const user = await getSessionUser();
  const { history, requests, settings } = await walletData(user);

  return (
    <div className="mx-auto max-w-3xl">
      <section className="relative overflow-hidden rounded-3xl bg-forest p-6 text-white guilloche sm:p-8">
        <p className="eyebrow text-gold">Wallet balance</p>
        <p className="mt-2 font-display text-5xl font-extrabold sm:text-6xl">{rs(user.walletBalance)}</p>
        <p className="mt-2 text-sm text-white/60">Use it to buy tickets. Winnings and refunds land here.</p>
        <WalletActions settings={settings} balance={user.walletBalance} openAdd={searchParams?.add === '1'} />
      </section>

      {requests.length > 0 && (
        <section className="mt-8">
          <h2 className="eyebrow text-ink-mute">Requests</h2>
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{r.kind === 'deposit' ? 'Add money' : 'Withdraw'} · {rs(r.amount)}</p>
                  <p className="text-sm text-ink-soft">{METHODS[r.method]} · {dateTime(r.at)}{r.note ? ` · ${r.note}` : ''}</p>
                </div>
                <span className={`chip ${REQ[r.status]}`}>{{ pending: 'Being checked', approved: 'Approved', rejected: 'Rejected' }[r.status]}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="eyebrow text-ink-mute">History</h2>
        {history.length === 0 ? (
          <p className="card mt-3 p-6 text-center text-ink-soft">No activity yet. Add money to buy your first ticket.</p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {history.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{TYPE[t.type] || t.type}</p>
                  <p className="truncate text-sm text-ink-soft">{t.note || ' '} · {dateTime(t.at)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-display text-lg font-bold ${t.amount > 0 ? 'text-jade' : 'text-ink'}`}>{t.amount > 0 ? '+' : '−'}{rs(Math.abs(t.amount))}</p>
                  <p className="text-xs text-ink-mute">Balance {rs(t.balance)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
