'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Only trust an internal admin destination to avoid open-redirects.
  const rawFrom = searchParams.get('from') || '';
  const from = rawFrom.startsWith('/admin') ? rawFrom : '/admin';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      // Full navigation so middleware re-runs with the new cookie.
      router.replace(from);
      router.refresh();
    } catch {
      setError('Network error — please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl"
      >
        <div className="mb-6">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-1">
            Dami Club
          </p>
          <h1 className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Admin Login
          </h1>
        </div>

        <label className="block text-xs font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />

        {error && (
          <p className="mt-3 text-xs font-semibold text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-6 w-full py-2.5 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-bold tracking-wide uppercase hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
