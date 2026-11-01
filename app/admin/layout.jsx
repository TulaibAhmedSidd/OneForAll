import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import AdminNav from './AdminNav';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin' };

export default async function AdminLayout({ children }) {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/admin');
  if (!user.isAdmin) redirect('/play');

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[240px_1fr]">
      <AdminNav name={user.username} />
      <main className="min-w-0 px-4 py-6 sm:px-8 lg:py-10">{children}</main>
    </div>
  );
}
