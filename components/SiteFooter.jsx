import Link from 'next/link';
import Logo from './Logo';

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="wrap grid gap-8 py-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            Small tickets, real prizes, and draws anyone can check. For players 18 and older. Only play with money you can spare.
          </p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3 text-ink-mute">Play</p>
          <ul className="space-y-2 font-medium">
            <li><Link href="/play" className="hover:text-jade">Live games</Link></li>
            <li><Link href="/tickets" className="hover:text-jade">My tickets</Link></li>
            <li><Link href="/wallet" className="hover:text-jade">Wallet</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3 text-ink-mute">Trust</p>
          <ul className="space-y-2 font-medium">
            <li><Link href="/fairness" className="hover:text-jade">How draws are checked</Link></li>
            <li><Link href="/rules" className="hover:text-jade">Rules &amp; refunds</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-ink-mute">© {new Date().getFullYear()} One For All</div>
    </footer>
  );
}
