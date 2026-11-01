import Link from 'next/link';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <Logo />
      <p className="font-mono text-6xl font-semibold text-gold-deep">404</p>
      <h1 className="font-display text-2xl font-bold">This page doesn&apos;t exist</h1>
      <Link href="/play" className="btn-gold">Go to games</Link>
    </main>
  );
}
