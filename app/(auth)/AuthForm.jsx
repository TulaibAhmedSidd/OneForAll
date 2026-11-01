'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/components/api';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '', referralCode: params.get('ref') || '', ageConfirmed: false });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = isRegister ? form : { email: form.email, password: form.password };
      await api(`/api/auth/${isRegister ? 'register' : 'login'}`, { method: 'POST', body });
      const next = params.get('next');
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/play');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4" noValidate={false}>
      {isRegister && (
        <div>
          <label className="label" htmlFor="username">Your name</label>
          <input id="username" className="field" autoComplete="name" required minLength={2} maxLength={40} value={form.username} onChange={set('username')} placeholder="Ali Raza" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" inputMode="email" className="field" autoComplete="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
      </div>
      {isRegister && (
        <div>
          <label className="label" htmlFor="phone">Mobile number <span className="font-normal text-ink-mute">(for prize delivery)</span></label>
          <input id="phone" type="tel" inputMode="tel" className="field" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="03001234567" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="password">Password</label>
        <div className="relative">
          <input id="password" type={show ? 'text' : 'password'} className="field pr-20" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 8 : 1} value={form.password} onChange={set('password')} placeholder={isRegister ? 'At least 8 characters' : ''} />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm font-semibold text-jade hover:bg-jade-light">
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      {isRegister && (
        <>
          <div>
            <label className="label" htmlFor="ref">Referral code <span className="font-normal text-ink-mute">(optional)</span></label>
            <input id="ref" className="field uppercase" value={form.referralCode} onChange={set('referralCode')} placeholder="OFA-XXXXXXXX" />
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-3.5 text-sm">
            <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[#1F7A5C]" checked={form.ageConfirmed} onChange={set('ageConfirmed')} required />
            <span>I am 18 or older and I accept the <a href="/rules" target="_blank" className="font-semibold text-jade underline">rules</a>.</span>
          </label>
        </>
      )}

      {error && <p role="alert" className="rounded-xl bg-coral-pale px-4 py-3 text-sm font-medium text-coral">{error}</p>}

      <button type="submit" className="btn-gold w-full text-base" disabled={busy}>
        {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
      </button>
    </form>
  );
}
