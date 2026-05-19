'use client';

import { useState, useEffect } from 'react';
import { signUp } from '@/lib/auth-client';
import { use } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepted'>('loading');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch(`${API_URL}/api/invitations/validate/${token}`);
        const data = await res.json();
        if (data.valid) {
          setEmail(data.email);
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch {
        setStatus('invalid');
      }
    }
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Accept the invitation
      const acceptRes = await fetch(`${API_URL}/api/invitations/accept/${token}`, {
        method: 'POST',
      });

      if (!acceptRes.ok) {
        setError('Undangan tidak valid atau sudah kedaluwarsa.');
        setSubmitting(false);
        return;
      }

      // Create account
      const result = await signUp.email({ email, password, name });
      if (result.error) {
        setError(result.error.message || 'Gagal membuat akun.');
      } else {
        setStatus('accepted');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Memvalidasi undangan...</p>
      </main>
    );
  }

  if (status === 'invalid') {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Undangan Tidak Valid</h1>
          <p className="mt-2 text-gray-600">
            Link undangan ini tidak valid atau sudah kedaluwarsa.
          </p>
        </div>
      </main>
    );
  }

  if (status === 'accepted') {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">Berhasil!</h1>
          <p className="mt-2 text-gray-600">Akun berhasil dibuat. Mengalihkan...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Terima Undangan</h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          Buat akun untuk <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Nama lengkap"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Minimal 8 karakter"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Memproses...' : 'Buat Akun'}
          </button>
        </form>
      </div>
    </main>
  );
}
