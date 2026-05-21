'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StarIcon, XIcon } from '@/components/ui/icons';

interface Placeholder {
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  platforms: string[];
  promptBody: string;
  placeholders: Placeholder[];
  notes: string | null;
  isFavorite: boolean;
  isDefault: boolean;
  usageCount: number;
}

interface TemplateSelectorProps {
  projectId: string;
  onTemplateApplied: (prompt: string) => void;
}

export function TemplateSelector({
  projectId,
  onTemplateApplied,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<
    Record<string, string>
  >({});
  const [preview, setPreview] = useState('');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);

    const { data } = await apiFetch<{ templates: PromptTemplate[] }>(
      `/api/prompt-templates?${params.toString()}`,
    );
    if (data) setTemplates(data.templates);
    setLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const updatePreview = (body: string, values: Record<string, string>) => {
    const result = body.replace(/\{\{(\w+)\}\}/g, (match, key) =>
      values[key] !== undefined && values[key] !== '' ? values[key] : match,
    );
    setPreview(result);
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setError('');
    const defaults: Record<string, string> = {};
    for (const ph of template.placeholders) {
      defaults[ph.key] = ph.defaultValue || '';
    }
    setPlaceholderValues(defaults);
    updatePreview(template.promptBody, defaults);
  };

  const handlePlaceholderChange = (key: string, value: string) => {
    const updated = { ...placeholderValues, [key]: value };
    setPlaceholderValues(updated);
    if (selectedTemplate) updatePreview(selectedTemplate.promptBody, updated);
  };

  const handleApply = async () => {
    if (!selectedTemplate) return;

    for (const ph of selectedTemplate.placeholders) {
      if (ph.required && !placeholderValues[ph.key]?.trim()) {
        setError(`Placeholder "${ph.label}" wajib diisi`);
        return;
      }
    }

    setApplying(true);
    setError('');

    const { data, error: fetchError } = await apiFetch<{ prompt: string }>(
      `/api/prompt-templates/${selectedTemplate.id}/apply`,
      {
        method: 'POST',
        body: JSON.stringify({ projectId, values: placeholderValues }),
      },
    );

    if (fetchError) {
      setError(fetchError);
    } else if (data) {
      onTemplateApplied(data.prompt);
      setSelectedTemplate(null);
      setPlaceholderValues({});
      setPreview('');
    }
    setApplying(false);
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setPlaceholderValues({});
    setPreview('');
    setError('');
  };

  if (loading) {
    return <p className="text-xs text-foreground-subtle">Memuat template...</p>;
  }

  if (templates.length === 0 && !searchQuery) {
    return (
      <p className="text-xs text-foreground-subtle">
        Belum ada template.{' '}
        <Link
          href="/settings"
          className="font-medium text-brand hover:opacity-80"
        >
          Buat template
        </Link>
      </p>
    );
  }

  if (selectedTemplate) {
    return (
      <div className="rounded-md border border-brand/30 bg-brand-soft/40 p-4 animate-in-fade">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            Template: {selectedTemplate.name}
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-sm p-1 text-foreground-subtle hover:bg-surface-sunken hover:text-foreground"
            aria-label="Batal"
          >
            <XIcon size={14} />
          </button>
        </div>

        {selectedTemplate.placeholders.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
              Isi placeholder
            </p>
            {selectedTemplate.placeholders.map((ph) => (
              <div key={ph.key}>
                <label className="mb-1 block text-xs text-foreground-muted">
                  {ph.label}
                  {ph.required && (
                    <span className="ml-0.5 text-danger">*</span>
                  )}
                </label>
                <Input
                  value={placeholderValues[ph.key] || ''}
                  onChange={(e) =>
                    handlePlaceholderChange(ph.key, e.target.value)
                  }
                  placeholder={
                    ph.description || ph.defaultValue || `Isi ${ph.label}`
                  }
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
            Preview
          </p>
          <pre className="mt-1.5 max-h-40 overflow-y-auto rounded-sm border border-border bg-surface-raised p-3 font-mono text-xs leading-relaxed text-foreground-muted whitespace-pre-wrap">
            {preview}
          </pre>
        </div>

        {error && (
          <p className="mt-3 text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="mt-4">
          <Button
            size="sm"
            onClick={handleApply}
            loading={applying}
            fullWidth
          >
            {applying ? 'Menerapkan...' : 'Terapkan Template'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Cari template..."
        className="h-9 text-sm"
      />
      {templates.length === 0 ? (
        <p className="text-xs text-foreground-subtle">
          Tidak ada template yang cocok.
        </p>
      ) : (
        <div className="max-h-56 space-y-1.5 overflow-y-auto">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelectTemplate(template)}
              className="w-full rounded-sm border border-border bg-surface-raised px-3 py-2 text-left transition-colors duration-150 hover:border-border-strong hover:bg-surface-sunken"
            >
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {template.name}
                </span>
                {template.isFavorite && (
                  <StarIcon size={12} filled className="text-warning" />
                )}
                {template.isDefault && (
                  <Badge tone="success">Default</Badge>
                )}
              </div>
              {template.description && (
                <p className="mt-0.5 truncate text-xs text-foreground-muted">
                  {template.description}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
