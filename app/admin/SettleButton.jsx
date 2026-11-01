'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { api } from '@/components/api';

export default function SettleButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try {
      const { settled } = await api('/api/admin/settings', { method: 'POST' });
      toast.success(settled.length ? `Settled ${settled.length} game(s) whose time was up.` : 'No games were due.');
      router.refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button onClick={run} disabled={busy} className="btn-ghost" title="Draw or refund every game whose end time has passed">
      {busy ? 'Settling…' : 'Settle due games'}
    </button>
  );
}
