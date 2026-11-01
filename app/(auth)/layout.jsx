import Link from 'next/link';
import { redirect } from 'next/navigation';
import Logo from '@/components/Logo';
import { getSessionUser } from '@/lib/auth';

export default async function AuthLayout({ children }) {
  const user = await getSessionUser().catch(() => null);
  if (user) redirect('/play');

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-forest p-10 text-white guilloche lg:flex">
        <Link href="/"><Logo light /></Link>
        <div>
          <div className="relative mb-10 w-72 rotate-[-4deg] rounded-2xl bg-white/95 p-5 text-ink shadow-lift">
            <p className="eyebrow text-jade">Ticket</p>
            <p className="font-display text-2xl font-bold">Galaxy A15 draw</p>
            <p className="mt-6 font-mono text-2xl tracking-widest text-forest">No. 004217</p>
            <span className="absolute right-4 top-4 rotate-[-8deg] rounded-md border-2 border-jade px-2 py-0.5 font-display text-xs font-extrabold uppercase text-jade">Paid Rs 5</span>
          </div>
          <h2 className="max-w-sm font-display text-4xl font-extrabold leading-tight">
            One ticket is all it takes.
          </h2>
          <p className="mt-3 max-w-sm text-white/70">Refunds are automatic if a game doesn&apos;t fill. Every draw can be checked by anyone.</p>
        </div>
        <p className="text-xs text-white/50">18+ only. Play with money you can spare.</p>
      </aside>
      <section className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" className="lg:hidden"><Logo /></Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </section>
    </main>
  );
}
