import Link from 'next/link';
import Logo from './Logo';
import { rs } from '@/lib/format';

export default function SiteHeader({ user }) {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="wrap flex h-16 items-center justify-between sm:h-20">
        <Link href="/" aria-label="One For All home"><Logo light /></Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-white/80 md:flex">
          <Link href="/#games" className="hover:text-white">Live games</Link>
          <Link href="/#how" className="hover:text-white">How it works</Link>
          <Link href="/fairness" className="hover:text-white">Fair draws</Link>
          <Link href="/rules" className="hover:text-white">Rules</Link>
        </nav>
        {user ? (
          <Link href="/play" className="btn-sm btn-gold">
            {rs(user.walletBalance)} · Open app
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-sm btn rounded-lg px-3 text-white hover:bg-white/10">Log in</Link>
            <Link href="/register" className="btn-sm btn-gold">Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
}
