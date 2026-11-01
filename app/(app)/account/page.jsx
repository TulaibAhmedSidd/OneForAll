import Link from 'next/link';
import { LuShieldCheck, LuScale, LuBookOpen } from 'react-icons/lu';
import { getSessionUser } from '@/lib/auth';
import { rs } from '@/lib/format';
import LogoutButton from './LogoutButton';
import CopyButton from '@/components/CopyButton';

export const metadata = { title: 'Account' };

export default async function AccountPage() {
  const user = await getSessionUser();
  const stats = [
    ['Balance', rs(user.walletBalance)],
    ['Games played', user.gamesPlayed || 0],
    ['Prizes won', user.prizesWon || 0],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="card flex items-center gap-4 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest font-display text-2xl font-bold text-gold">{user.username[0]?.toUpperCase()}</span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold">{user.username}</h1>
          <p className="truncate text-sm text-ink-soft">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {stats.map(([k, v]) => (
          <div key={k} className="card p-4 text-center">
            <p className="font-display text-2xl font-extrabold">{v}</p>
            <p className="text-xs text-ink-soft">{k}</p>
          </div>
        ))}
      </section>

      {user.referralCode && (
        <section className="card p-5">
          <p className="eyebrow text-jade">Invite friends</p>
          <p className="mt-1 text-ink-soft">Share your code. Friends enter it when they sign up.</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-xl bg-paper px-4 py-3 font-mono text-lg">{user.referralCode}</code>
            <CopyButton text={user.referralCode} />
          </div>
        </section>
      )}

      <section className="card divide-y divide-line">
        {user.isAdmin && (
          <Link href="/admin" className="flex items-center gap-3 p-4 font-semibold text-forest hover:bg-paper"><LuShieldCheck className="text-gold-deep" /> Admin panel</Link>
        )}
        <Link href="/fairness" className="flex items-center gap-3 p-4 font-semibold hover:bg-paper"><LuScale className="text-jade" /> How draws are checked</Link>
        <Link href="/rules" className="flex items-center gap-3 p-4 font-semibold hover:bg-paper"><LuBookOpen className="text-jade" /> Rules &amp; refunds</Link>
      </section>

      <LogoutButton />
    </div>
  );
}
