'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface ApiToken {
  id: string;
  name: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export function ApiTokenList() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTokens = useCallback(async () => {
    const { data } = await apiFetch<{ tokens: ApiToken[] }>('/api/tokens');
    if (data) {
      setTokens(data.tokens);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const { data } = await apiFetch<{ token: ApiToken & { value: string } }>(
      '/api/tokens',
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      }
    );

    if (data) {
      setNewTokenValue(data.token.value);
      setName('');
      setShowForm(false);
      fetchTokens();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus token ini? Token tidak bisa digunakan lagi.')) return;
    await apiFetch(`/api/tokens/${id}`, { method: 'DELETE' });
    fetchTokens();
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Memuat token...</p>;
  }

  return (
    <div className="space-y-4">
      {newTokenValue && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            Token berhasil dibuat. Salin sekarang — tidak akan ditampilkan lagi.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-white px-3 py-2 text-xs font-mono border border-yellow-200 break-all">
              {newTokenValue}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newTokenValue);
              }}
              className="rounded border border-yellow-300 px-3 py-1.5 text-xs hover:bg-yellow-100"
            >
              Salin
            </button>
          </div>
          <button
            onClick={() => setNewTokenValue(null)}
            className="mt-2 text-xs text-yellow-700 hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {tokens.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Belum ada API token. Token digunakan untuk akses API eksternal.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Buat Token
          </button>
        </div>
      )}

      {tokens.map((token) => (
        <div key={token.id} className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{token.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Dibuat {new Date(token.createdAt).toLocaleDateString('id-ID')}
              {token.lastUsedAt && ` · Terakhir digunakan ${new Date(token.lastUsedAt).toLocaleDateString('id-ID')}`}
              {token.expiresAt && ` · Kedaluwarsa ${new Date(token.expiresAt).toLocaleDateString('id-ID')}`}
            </p>
          </div>
          <button
            onClick={() => handleDelete(token.id)}
            className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
          >
            Hapus
          </button>
        </div>
      ))}

      {tokens.length > 0 && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          + Buat Token Baru
        </button>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <div>
            <label htmlFor="tokenName" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Token
            </label>
            <input
              id="tokenName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Contoh: Content Pipeline"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Membuat...' : 'Buat'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
