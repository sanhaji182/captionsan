'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { SparklesIcon } from '@/components/ui/icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || 'Login gagal');
      } else {
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-in-fade">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand text-brand-foreground">
            <SparklesIcon size={14} />
          </span>
          CaptionSan
        </Link>

        <h1 className="display text-2xl font-semibold text-foreground">
          Masuk ke akun Anda
        </h1>
        <p className="mt-1.5 text-sm text-foreground-muted">
          Gunakan email yang menerima undangan.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="email@contoh.com"
            />
          </Field>

          <Field label="Kata Sandi" htmlFor="password">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-foreground-subtle">
          Hanya pengguna yang diundang dapat mengakses CaptionSan.
        </p>
      </div>
    </main>
  );
}
