'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuTicket, LuWallet, LuUserRound, LuLayoutGrid, LuShieldCheck } from 'react-icons/lu';
import Logo from './Logo';
import { rs } from '@/lib/format';

const TABS = [
  { href: '/play', label: 'Games', icon: LuLayoutGrid },
  { href: '/tickets', label: 'My tickets', icon: LuTicket },
  { href: '/wallet', label: 'Wallet', icon: LuWallet },
  { href: '/account', label: 'Account', icon: LuUserRound },
];

export default function AppNav({ user }) {
  const path = usePathname();
  const active = (href) => path === href || path.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-forest text-white">
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label="Home"><Logo light /></Link>
          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <Link key={t.href} href={t.href} className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${active(t.href) ? 'bg-white/10 text-gold' : 'text-white/75 hover:text-white'}`}>
                {t.label}
              </Link>
            ))}
            {user.isAdmin && (
              <Link href="/admin" className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-gold/40 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/10">
                <LuShieldCheck /> Admin
              </Link>
            )}
          </nav>
          <Link href="/wallet" className="inline-flex items-center gap-2 rounded-full bg-gold px-3.5 py-1.5 text-sm font-bold text-forest-deep shadow-[inset_0_-2px_0_rgba(0,0,0,.12)]">
            <LuWallet aria-hidden="true" /> {rs(user.walletBalance)}
          </Link>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Main">
        <ul className="grid grid-cols-4">
          {TABS.map((t) => {
            const on = active(t.href);
            return (
              <li key={t.href}>
                <Link href={t.href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${on ? 'text-jade' : 'text-ink-mute'}`} aria-current={on ? 'page' : undefined}>
                  <span className={`flex h-8 w-12 items-center justify-center rounded-full text-xl transition ${on ? 'bg-jade-light' : ''}`}><t.icon /></span>
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
