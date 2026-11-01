import Logo from '@/components/Logo';

export const metadata = { title: 'Offline' };

export default function Offline() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <Logo />
      <h1 className="font-display text-3xl font-extrabold">You&apos;re offline</h1>
      <p className="max-w-sm text-ink-soft">Tickets and balances need a live connection. Reconnect to the internet and refresh.</p>
    </main>
  );
}
