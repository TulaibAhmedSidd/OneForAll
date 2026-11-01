import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: 'Rules & refunds' };
export const dynamic = 'force-dynamic';

const RULES = [
  ['Who can play', ['You must be 18 or older.', 'One account per person. Duplicate accounts can be closed and their balance held until checked.']],
  ['Tickets', ['Each game has a fixed ticket price and a fixed number of tickets.', 'You can buy one ticket per game.', 'The price, number of tickets and prizes never change after a game opens.']],
  ['Draws', ['A game is drawn as soon as the last ticket sells, or when its closing time arrives — whichever comes first.', 'Winners are picked by ticket number with the published fingerprint method on the Fair draws page.']],
  ['Refunds', ['If a game closes with fewer players than prizes, it is cancelled and every ticket is refunded to your wallet automatically.', 'If we cancel a game for any reason, every ticket is refunded.']],
  ['Wallet', ['Money you add is credited after we match your transaction ID. Each transaction ID can be used once.', 'Withdrawals are held from your balance straight away and returned if the request is rejected.', 'Cash prizes are paid into your wallet when the draw runs.']],
  ['Prizes', ['Item prizes are delivered to the name and phone number on your account. Keep them up to date.', 'Unclaimed item prizes are held for 30 days after the draw.']],
  ['Play responsibly', ['Only spend money you can afford to lose. Tickets are entertainment, not income.', 'If you want your account closed or limited, contact support and we will do it.']],
];

export default async function Rules() {
  const user = await getSessionUser().catch(() => null);
  return (
    <>
      <SiteHeader user={user} />
      <section className="bg-forest pb-12 pt-28 text-white guilloche sm:pt-32">
        <div className="wrap max-w-3xl">
          <p className="eyebrow text-gold">Rules</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Rules &amp; refunds</h1>
        </div>
      </section>
      <main className="wrap max-w-3xl space-y-4 py-12">
        {RULES.map(([title, items]) => (
          <section key={title} className="card p-5">
            <h2 className="font-display text-xl font-bold">{title}</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-soft">{items.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
