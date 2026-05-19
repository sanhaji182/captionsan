'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api';

export default function NewProjectPage() {
  const { data: session, isPending } = useSession();
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState<'idea' | 'draft'>('idea');
  const [originalInput, setOriginalInput] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </main>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { data, error: fetchError } = await apiFetch<{ project: { id: string } }>(
      '/api/projects',
      {
        method: 'POST',
        body: JSON.stringify({
          title,
          sourceType,
          originalInput,
          additionalContext: additionalContext || undefined,
        }),
      }
    );

    if (fetchError) {
      setError(fetchError);
      setSubmitting(false);
    } else if (data) {
      window.location.href = `/projects/${data.project.id}`;
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Proyek Baru</h1>
        <a
          href="/dashboard"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
        >
          Kembali
        </a>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Judul Proyek
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="Contoh: Promo Akhir Tahun"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipe Input
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sourceType"
                value="idea"
                checked={sourceType === 'idea'}
                onChange={() => setSourceType('idea')}
                className="text-gray-900"
              />
              <span className="text-sm">Ide / Poin Utama</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sourceType"
                value="draft"
                checked={sourceType === 'draft'}
                onChange={() => setSourceType('draft')}
                className="text-gray-900"
              />
              <span className="text-sm">Draft Kasar</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="originalInput" className="block text-sm font-medium text-gray-700 mb-1">
            {sourceType === 'idea' ? 'Ide Utama' : 'Draft Kasar'}
          </label>
          <textarea
            id="originalInput"
            value={originalInput}
            onChange={(e) => setOriginalInput(e.target.value)}
            required
            rows={8}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-y"
            placeholder={
              sourceType === 'idea'
                ? 'Tulis ide utama atau poin-poin yang ingin disampaikan...'
                : 'Tulis draft kasar konten Anda di sini...'
            }
          />
        </div>

        <div>
          <label htmlFor="additionalContext" className="block text-sm font-medium text-gray-700 mb-1">
            Konteks Tambahan <span className="text-gray-400">(opsional)</span>
          </label>
          <textarea
            id="additionalContext"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-y"
            placeholder="Target audiens, tone yang diinginkan, informasi brand, dll."
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Membuat proyek...' : 'Buat Proyek'}
        </button>
      </form>
    </main>
  );
}
