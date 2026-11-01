'use client';

import Link from 'next/link';

export default function Error({ reset }) {
  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-3xl font-extrabold">This page didn&apos;t load</h1>
      <p className="max-w-sm text-ink-soft">The server may be busy or your connection dropped. Your wallet and tickets are safe.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-gold">Try again</button>
        <Link href="/" className="btn-ghost">Home</Link>
      </div>
    </main>
  );
}
