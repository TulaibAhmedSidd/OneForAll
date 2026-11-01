'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/components/api';

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace('/');
    router.refresh();
  }
  return <button onClick={logout} className="btn-ghost w-full text-coral hover:border-coral hover:text-coral">Log out</button>;
}
