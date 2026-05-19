'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
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
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const fetchConnections = useCallback(async () => {
    const { data } = await apiFetch<{ connections: ProviderConnection[] }>('/api/providers');
    if (data) {
      setConnections(data.connections);
    }
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

    const { data, error } = await apiFetch<{ success: boolean; message: string }>(
      `/api/providers/${id}/test`,
      { method: 'POST' }
    );

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
    return <p className="text-sm text-gray-500">Memuat provider...</p>;
  }

  return (
    <div className="space-y-4">
      {connections.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Belum ada provider yang dikonfigurasi.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Tambah Provider
          </button>
        </div>
      )}

      {connections.map((conn) => (
        <div
          key={conn.id}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{conn.providerName}</h3>
                {conn.isDefault && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {conn.baseUrl} · {conn.model}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTest(conn.id)}
                disabled={testingId === conn.id}
                className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {testingId === conn.id ? 'Testing...' : 'Test'}
              </button>
              <button
                onClick={() => setEditingId(conn.id)}
                className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(conn.id)}
                className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>

          {testResult && testResult.id === conn.id && (
            <div
              className={`mt-3 rounded p-2 text-xs ${
                testResult.success
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {editingId === conn.id && (
            <div className="mt-4 border-t pt-4">
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
        </div>
      ))}

      {connections.length > 0 && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          + Tambah Provider
        </button>
      )}

      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-medium mb-4">Tambah Provider Baru</h3>
          <ProviderForm
            onSaved={handleSaved}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
}
