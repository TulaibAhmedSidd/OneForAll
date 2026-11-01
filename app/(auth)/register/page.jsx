import { Suspense } from 'react';
import Link from 'next/link';
import AuthForm from '../AuthForm';

export const metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold">Create your account</h1>
      <p className="mt-2 text-ink-soft">Free to join. You only pay when you buy a ticket.</p>
      <Suspense><AuthForm mode="register" /></Suspense>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account? <Link href="/login" className="font-semibold text-jade hover:underline">Log in</Link>
      </p>
    </>
  );
}
