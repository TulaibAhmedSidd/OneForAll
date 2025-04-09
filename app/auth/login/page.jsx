'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);  // Store JWT token in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));  // Store user info
      router.push('/dashboard');  // Redirect to Dashboard
    } else {
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20">
      <h2 className="text-2xl font-semibold text-center mb-4">Login to OneForAll</h2>
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded-md">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
