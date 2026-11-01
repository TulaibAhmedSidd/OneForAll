'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuGauge, LuTicket, LuGift, LuBanknote, LuUsers, LuSettings, LuArrowLeft } from 'react-icons/lu';
import Logo from '@/components/Logo';

const LINKS = [
  { href: '/admin', label: 'Overview', icon: LuGauge, exact: true },
  { href: '/admin/games', label: 'Games', icon: LuTicket },
  { href: '/admin/prizes', label: 'Prizes', icon: LuGift },
  { href: '/admin/payments', label: 'Payments', icon: LuBanknote },
  { href: '/admin/users', label: 'Players', icon: LuUsers },
  { href: '/admin/settings', label: 'Settings', icon: LuSettings },
];

export default function AdminNav({ name }) {
  const path = usePathname();
  const on = (l) => (l.exact ? path === l.href : path.startsWith(l.href));

  return (
    <aside className="sticky top-0 z-30 bg-forest-deep text-white lg:h-dvh">
      <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-6">
        <Link href="/admin"><Logo light /></Link>
        <p className="eyebrow hidden text-gold lg:mt-2 lg:block">Admin · {name}</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${on(l) ? 'bg-gold text-forest-deep' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <l.icon className="text-base" /> {l.label}
          </Link>
        ))}
        <Link href="/play" className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/50 hover:text-white lg:mt-6">
          <LuArrowLeft /> Player app
        </Link>
      </nav>
    </aside>
  );
}
