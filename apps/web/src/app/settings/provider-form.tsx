'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { CheckCircleIcon, XIcon } from '@/components/ui/icons';

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

export function ProviderForm({
  editId,
  initialData,
  onSaved,
  onCancel,
}: ProviderFormProps) {
  const [providerName, setProviderName] = useState(
    initialData?.providerName || 'OpenAI',
  );
  const [baseUrl, setBaseUrl] = useState(
    initialData?.baseUrl || 'https://api.openai.com/v1',
  );
  const [model, setModel] = useState(initialData?.model || 'gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTest = async () => {
    if (!baseUrl || !apiKey) {
      setTestResult({
        success: false,
        message: 'Base URL dan API Key diperlukan untuk test',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const { data, error: fetchError } = await apiFetch<{
      success: boolean;
      message: string;
    }>('/api/providers/test-inline', {
      method: 'POST',
      body: JSON.stringify({ baseUrl, apiKey }),
    });

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

    if (fetchError) setError(fetchError);
    else onSaved();
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nama Provider" htmlFor="providerName">
          <Input
            id="providerName"
            type="text"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            required
            placeholder="OpenAI"
          />
        </Field>
        <Field label="Model" htmlFor="model">
          <Input
            id="model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
            placeholder="gpt-4o-mini"
          />
        </Field>
      </div>

      <Field label="Base URL" htmlFor="baseUrl">
        <Input
          id="baseUrl"
          type="url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          required
          placeholder="https://api.openai.com/v1"
        />
      </Field>

      <Field
        label="API Key"
        htmlFor="apiKey"
        hint={
          editId ? 'Kosongkan jika tidak ingin mengubah.' : undefined
        }
      >
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required={!editId}
          placeholder="sk-..."
          autoComplete="off"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-foreground-muted">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 rounded-sm border-border-strong accent-brand"
        />
        Jadikan default
      </label>

      {testResult && (
        <div
          className={
            testResult.success
              ? 'flex items-start gap-2 rounded-sm border border-success/30 bg-success-soft px-3 py-2 text-xs text-success'
              : 'flex items-start gap-2 rounded-sm border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger'
          }
        >
          {testResult.success ? (
            <CheckCircleIcon size={14} />
          ) : (
            <XIcon size={14} />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleTest}
          loading={testing}
        >
          {testing ? 'Testing...' : 'Test Koneksi'}
        </Button>
        <Button type="submit" loading={submitting}>
          {submitting ? 'Menyimpan...' : editId ? 'Perbarui' : 'Simpan'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  );
}
