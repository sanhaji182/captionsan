'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckCircleIcon, PlugIcon, PlusIcon, XIcon } from '@/components/ui/icons';
import { ProviderForm } from './provider-form';

interface ProviderConnection {
  id: string;
  providerName: string;
  baseUrl: string;
  model: string;
  isDefault: boolean;
  createdAt: string;
}

export function ProviderList() {
  const [connections, setConnections] = useState<ProviderConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    id: string;
    success: boolean;
    message: string;
  } | null>(null);

  const fetchConnections = useCallback(async () => {
    const { data } = await apiFetch<{ connections: ProviderConnection[] }>(
      '/api/providers',
    );
    if (data) setConnections(data.connections);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus koneksi provider ini?')) return;
    await apiFetch(`/api/providers/${id}`, { method: 'DELETE' });
    fetchConnections();
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);

    const { data, error } = await apiFetch<{
      success: boolean;
      message: string;
    }>(`/api/providers/${id}/test`, { method: 'POST' });

    if (data) {
      setTestResult({ id, success: data.success, message: data.message });
    } else {
      setTestResult({ id, success: false, message: error || 'Test failed' });
    }
    setTestingId(null);
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingId(null);
    fetchConnections();
  };

  if (loading) {
    return <p className="text-sm text-foreground-muted">Memuat provider...</p>;
  }

  return (
    <div className="space-y-4">
      {connections.length === 0 && !showForm && (
        <EmptyState
          icon={<PlugIcon size={18} />}
          title="Belum ada provider"
          description="Tambahkan koneksi ke OpenAI atau provider yang kompatibel agar CaptionSan bisa membuat prompt dan konten."
          action={
            <Button onClick={() => setShowForm(true)}>
              <PlusIcon size={14} />
              Tambah Provider
            </Button>
          }
        />
      )}

      {connections.length > 0 && (
        <ul className="space-y-2">
          {connections.map((conn) => (
            <li
              key={conn.id}
              className="rounded-md border border-border bg-surface-raised shadow-xs"
            >
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium text-foreground">
                      {conn.providerName}
                    </h3>
                    {conn.isDefault && <Badge tone="success">Default</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-foreground-muted">
                    {conn.baseUrl} · {conn.model}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTest(conn.id)}
                    loading={testingId === conn.id}
                  >
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(conn.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(conn.id)}
                    className="text-danger hover:bg-danger-soft hover:text-danger"
                  >
                    Hapus
                  </Button>
                </div>
              </div>

              {testResult && testResult.id === conn.id && (
                <div
                  className={
                    testResult.success
                      ? 'flex items-center gap-2 border-t border-border bg-success-soft px-4 py-2 text-xs text-success'
                      : 'flex items-center gap-2 border-t border-border bg-danger-soft px-4 py-2 text-xs text-danger'
                  }
                >
                  {testResult.success ? (
                    <CheckCircleIcon size={14} />
                  ) : (
                    <XIcon size={14} />
                  )}
                  {testResult.message}
                </div>
              )}

              {editingId === conn.id && (
                <div className="border-t border-border bg-surface-sunken/40 p-4 animate-in-fade">
                  <ProviderForm
                    editId={conn.id}
                    initialData={{
                      providerName: conn.providerName,
                      baseUrl: conn.baseUrl,
                      model: conn.model,
                      isDefault: conn.isDefault,
                    }}
                    onSaved={handleSaved}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {connections.length > 0 && !showForm && (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          <PlusIcon size={14} />
          Tambah Provider
        </Button>
      )}

      {showForm && (
        <div className="rounded-md border border-border bg-surface-sunken/40 p-4 animate-in-fade">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Tambah Provider Baru
          </h3>
          <ProviderForm
            onSaved={handleSaved}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
}
