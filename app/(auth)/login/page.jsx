import { Suspense } from 'react';
import Link from 'next/link';
import AuthForm from '../AuthForm';

export const metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold">Welcome back</h1>
      <p className="mt-2 text-ink-soft">Log in to see your tickets and wallet.</p>
      <Suspense><AuthForm mode="login" /></Suspense>
      <p className="mt-6 text-center text-sm text-ink-soft">
        New here? <Link href="/register" className="font-semibold text-jade hover:underline">Create a free account</Link>
      </p>
    </>
  );
}
