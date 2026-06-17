'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="text-sm text-slate-300 px-3 py-1.5 md:px-4 md:py-2 bg-slate-700/40 rounded-md border border-slate-600 hover:bg-slate-700 hover:text-white disabled:opacity-50 transition-colors"
    >
      {loading ? 'Signing out…' : 'Logout'}
    </button>
  );
}
