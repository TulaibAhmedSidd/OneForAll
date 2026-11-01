import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AppNav from '@/components/AppNav';
import { getSessionUser, publicUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }) {
  const user = await getSessionUser();
  if (!user) {
    const path = headers().get('x-pathname') || '/play';
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }
  const { announcement } = await getSettings().catch(() => ({}));

  return (
    <div className="min-h-dvh pb-24 md:pb-10">
      <AppNav user={publicUser(user)} />
      {announcement && (
        <div className="bg-gold-pale text-center text-sm font-medium text-forest">
          <p className="wrap py-2">{announcement}</p>
        </div>
      )}
      <main className="wrap pt-6">{children}</main>
    </div>
  );
}
