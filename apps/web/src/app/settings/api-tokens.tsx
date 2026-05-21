'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import {
  CheckIcon,
  ClipboardIcon,
  KeyIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from '@/components/ui/icons';

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
  const [copied, setCopied] = useState(false);

  const fetchTokens = useCallback(async () => {
    const { data } = await apiFetch<{ tokens: ApiToken[] }>('/api/tokens');
    if (data) setTokens(data.tokens);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const { data } = await apiFetch<{
      token: ApiToken & { value: string };
    }>('/api/tokens', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

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

  const handleCopyToken = async () => {
    if (!newTokenValue) return;
    await navigator.clipboard.writeText(newTokenValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <p className="text-sm text-foreground-muted">Memuat token...</p>;
  }

  return (
    <div className="space-y-4">
      {newTokenValue && (
        <div className="rounded-md border border-warning/30 bg-warning-soft p-4 animate-in-fade">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-warning">
                Token berhasil dibuat
              </p>
              <p className="mt-0.5 text-xs text-foreground-muted">
                Salin sekarang. Token tidak akan ditampilkan lagi setelah
                ditutup.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewTokenValue(null)}
              className="rounded-sm p-1 text-foreground-subtle hover:bg-surface-raised hover:text-foreground"
              aria-label="Tutup"
            >
              <XIcon size={14} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 break-all rounded-sm border border-border bg-surface-raised px-3 py-2 font-mono text-xs text-foreground">
              {newTokenValue}
            </code>
            <Button variant="secondary" size="sm" onClick={handleCopyToken}>
              {copied ? (
                <>
                  <CheckIcon size={14} />
                  Disalin
                </>
              ) : (
                <>
                  <ClipboardIcon size={14} />
                  Salin
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {tokens.length === 0 && !showForm && (
        <EmptyState
          icon={<KeyIcon size={18} />}
          title="Belum ada API token"
          description="Token digunakan untuk mengakses CaptionSan API dari pipeline atau aplikasi eksternal."
          action={
            <Button onClick={() => setShowForm(true)}>
              <PlusIcon size={14} />
              Buat Token
            </Button>
          }
        />
      )}

      {tokens.length > 0 && (
        <ul className="space-y-2">
          {tokens.map((token) => (
            <li
              key={token.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-raised px-4 py-3 shadow-xs"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {token.name}
                </p>
                <p className="mt-0.5 text-xs text-foreground-subtle">
                  Dibuat{' '}
                  {new Date(token.createdAt).toLocaleDateString('id-ID')}
                  {token.lastUsedAt &&
                    ` · Terakhir digunakan ${new Date(
                      token.lastUsedAt,
                    ).toLocaleDateString('id-ID')}`}
                  {token.expiresAt &&
                    ` · Kedaluwarsa ${new Date(
                      token.expiresAt,
                    ).toLocaleDateString('id-ID')}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(token.id)}
                className="text-danger hover:bg-danger-soft hover:text-danger"
              >
                <TrashIcon size={14} />
                Hapus
              </Button>
            </li>
          ))}
        </ul>
      )}

      {tokens.length > 0 && !showForm && (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          <PlusIcon size={14} />
          Buat Token Baru
        </Button>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-md border border-border bg-surface-sunken/40 p-4 animate-in-fade"
        >
          <Field label="Nama Token" htmlFor="tokenName">
            <Input
              id="tokenName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Content Pipeline"
            />
          </Field>
          <div className="flex items-center gap-2">
            <Button type="submit" loading={submitting}>
              {submitting ? 'Membuat...' : 'Buat Token'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setName('');
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
