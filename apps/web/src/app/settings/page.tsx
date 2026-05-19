'use client';

import { useSession } from '@/lib/auth-client';
import { ProviderList } from './provider-list';
import { ApiTokenList } from './api-tokens';

export default function SettingsPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </main>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <a
          href="/dashboard"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
        >
          Kembali
        </a>
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Koneksi AI Provider</h2>
        <p className="text-sm text-gray-500 mb-6">
          Tambahkan konfigurasi provider AI Anda. CaptionSan mendukung provider yang kompatibel dengan OpenAI API.
        </p>
        <ProviderList />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">API Token</h2>
        <p className="text-sm text-gray-500 mb-6">
          Buat token untuk mengakses CaptionSan API dari pipeline atau aplikasi eksternal.
        </p>
        <ApiTokenList />
      </section>
    </main>
  );
}
