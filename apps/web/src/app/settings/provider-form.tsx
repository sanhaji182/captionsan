'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface ProviderFormProps {
  editId?: string;
  initialData?: {
    providerName: string;
    baseUrl: string;
    model: string;
    isDefault: boolean;
  };
  onSaved: () => void;
  onCancel: () => void;
}

export function ProviderForm({ editId, initialData, onSaved, onCancel }: ProviderFormProps) {
  const [providerName, setProviderName] = useState(initialData?.providerName || 'OpenAI');
  const [baseUrl, setBaseUrl] = useState(initialData?.baseUrl || 'https://api.openai.com/v1');
  const [model, setModel] = useState(initialData?.model || 'gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!baseUrl || !apiKey) {
      setTestResult({ success: false, message: 'Base URL dan API Key diperlukan untuk test' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const { data, error: fetchError } = await apiFetch<{ success: boolean; message: string }>(
      '/api/providers/test-inline',
      {
        method: 'POST',
        body: JSON.stringify({ baseUrl, apiKey }),
      }
    );

    if (data) {
      setTestResult({ success: data.success, message: data.message });
    } else {
      setTestResult({ success: false, message: fetchError || 'Test failed' });
    }
    setTesting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload: Record<string, unknown> = {
      providerName,
      baseUrl,
      model,
      isDefault,
    };

    // API key is required for new connections, optional for edits
    if (apiKey) {
      payload.apiKey = apiKey;
    } else if (!editId) {
      setError('API Key diperlukan');
      setSubmitting(false);
      return;
    }

    const method = editId ? 'PUT' : 'POST';
    const path = editId ? `/api/providers/${editId}` : '/api/providers';

    const { error: fetchError } = await apiFetch(path, {
      method,
      body: JSON.stringify(payload),
    });

    if (fetchError) {
      setError(fetchError);
    } else {
      onSaved();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="providerName" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Provider
          </label>
          <input
            id="providerName"
            type="text"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="OpenAI"
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            id="model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="gpt-4o-mini"
          />
        </div>
      </div>

      <div>
        <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Base URL
        </label>
        <input
          id="baseUrl"
          type="url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          placeholder="https://api.openai.com/v1"
        />
      </div>

      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
          API Key {editId && <span className="text-gray-400">(kosongkan jika tidak ingin mengubah)</span>}
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required={!editId}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          placeholder="sk-..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isDefault"
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="isDefault" className="text-sm text-gray-700">
          Jadikan default
        </label>
      </div>

      {testResult && (
        <div
          className={`rounded p-2 text-xs ${
            testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {testResult.message}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {testing ? 'Testing...' : 'Test Koneksi'}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Menyimpan...' : editId ? 'Perbarui' : 'Simpan'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
