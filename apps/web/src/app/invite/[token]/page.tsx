'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { CheckCircleIcon, SparklesIcon, XIcon } from '@/components/ui/icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [status, setStatus] = useState<
    'loading' | 'valid' | 'invalid' | 'accepted'
  >('loading');
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
      const acceptRes = await fetch(
        `${API_URL}/api/invitations/accept/${token}`,
        { method: 'POST' },
      );

      if (!acceptRes.ok) {
        setError('Undangan tidak valid atau sudah kedaluwarsa.');
        setSubmitting(false);
        return;
      }

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
        <p className="text-sm text-foreground-muted">Memvalidasi undangan...</p>
      </main>
    );
  }

  if (status === 'invalid') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm text-center animate-in-fade">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
            <XIcon size={20} />
          </div>
          <h1 className="display mt-4 text-2xl font-semibold text-foreground">
            Undangan Tidak Valid
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Link undangan ini tidak valid atau sudah kedaluwarsa.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-brand hover:opacity-80"
          >
            Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  if (status === 'accepted') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm text-center animate-in-fade">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircleIcon size={22} />
          </div>
          <h1 className="display mt-4 text-2xl font-semibold text-foreground">
            Berhasil!
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Akun berhasil dibuat. Mengalihkan ke dashboard...
          </p>
        </div>
      </main>
    );
  }

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
          Terima Undangan
        </h1>
        <p className="mt-1.5 text-sm text-foreground-muted">
          Buat akun untuk{' '}
          <span className="font-medium text-foreground">{email}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field label="Nama" htmlFor="name">
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Nama lengkap"
            />
          </Field>

          <Field
            label="Kata Sandi"
            htmlFor="password"
            hint="Minimal 8 karakter."
          >
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" loading={submitting} fullWidth size="lg">
            {submitting ? 'Memproses...' : 'Buat Akun'}
          </Button>
        </form>
      </div>
    </main>
  );
}
