'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import {
  EyeIcon,
  LayersIcon,
  PenIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from '@/components/ui/icons';
import { platformLabel } from '@/lib/status';
import { cn } from '@/lib/cn';
import { TemplateForm } from './template-form';
import { useEscapeKey } from '@/lib/use-escape-key';

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
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function TemplateList() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<PromptTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] =
    useState<PromptTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filterFavorites) params.set('favorites', 'true');

    const { data } = await apiFetch<{ templates: PromptTemplate[] }>(
      `/api/prompt-templates?${params.toString()}`,
    );
    if (data) setTemplates(data.templates);
    setLoading(false);
  }, [searchQuery, filterFavorites]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus template ini?')) return;
    await apiFetch(`/api/prompt-templates/${id}`, { method: 'DELETE' });
    fetchTemplates();
  };

  const handleToggleFavorite = async (id: string) => {
    await apiFetch(`/api/prompt-templates/${id}/favorite`, { method: 'POST' });
    fetchTemplates();
  };

  const handleSetDefault = async (id: string) => {
    await apiFetch(`/api/prompt-templates/${id}/default`, { method: 'POST' });
    fetchTemplates();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  const noResults =
    !loading && templates.length === 0 && (searchQuery || filterFavorites);
  const trulyEmpty =
    !loading && templates.length === 0 && !searchQuery && !filterFavorites;

  return (
    <div className="space-y-4">
      {/* Search and filter */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari template..."
          className="h-9 text-sm"
        />
        <Button
          variant={filterFavorites ? 'secondary' : 'ghost'}
          size="md"
          onClick={() => setFilterFavorites(!filterFavorites)}
          className={cn(
            'h-10 shrink-0',
            filterFavorites && 'border-warning/40 bg-warning-soft text-warning',
          )}
        >
          <StarIcon size={14} filled={filterFavorites} />
          Favorit
        </Button>
      </div>

      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {(showForm || editingTemplate) && (
        <div className="rounded-md border border-border bg-surface-sunken/40 p-4 animate-in-fade">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {editingTemplate ? 'Edit Template' : 'Tambah Template'}
          </h3>
          <TemplateForm
            editId={editingTemplate?.id}
            initialData={
              editingTemplate
                ? {
                    name: editingTemplate.name,
                    description: editingTemplate.description,
                    category: editingTemplate.category,
                    platforms: editingTemplate.platforms,
                    promptBody: editingTemplate.promptBody,
                    placeholders: editingTemplate.placeholders,
                    notes: editingTemplate.notes,
                    isFavorite: editingTemplate.isFavorite,
                    isDefault: editingTemplate.isDefault,
                  }
                : undefined
            }
            onSaved={handleSaved}
            onCancel={() => {
              setShowForm(false);
              setEditingTemplate(null);
            }}
          />
        </div>
      )}

      {loading && (
        <p className="text-sm text-foreground-muted">Memuat...</p>
      )}

      {trulyEmpty && (
        <EmptyState
          icon={<LayersIcon size={18} />}
          title="Belum ada template"
          description="Template prompt mempercepat pembuatan konten. Gunakan placeholder untuk bagian yang berubah-ubah."
          action={
            <Button onClick={() => setShowForm(true)}>
              <PlusIcon size={14} />
              Tambah Template
            </Button>
          }
        />
      )}

      {noResults && (
        <p className="text-sm text-foreground-muted">
          Tidak ada template yang cocok.
        </p>
      )}

      {templates.length > 0 && (
        <ul className="space-y-2">
          {templates.map((template) => (
            <li
              key={template.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface-raised px-4 py-3 shadow-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-medium text-foreground">
                    {template.name}
                  </h4>
                  {template.isDefault && <Badge tone="success">Default</Badge>}
                  {template.isFavorite && (
                    <StarIcon
                      size={12}
                      filled
                      className="text-warning"
                    />
                  )}
                </div>
                {template.description && (
                  <p className="mt-0.5 truncate text-xs text-foreground-muted">
                    {template.description}
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {template.category && (
                    <Badge tone="neutral">{template.category}</Badge>
                  )}
                  {template.platforms.map((p) => (
                    <Badge key={p} tone="info">
                      {platformLabel(p, true)}
                    </Badge>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-foreground-subtle">
                  Digunakan {template.usageCount}x
                  {template.lastUsedAt &&
                    ` · Terakhir ${new Date(
                      template.lastUsedAt,
                    ).toLocaleDateString('id-ID')}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <IconButton
                  label="Preview"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <EyeIcon size={14} />
                </IconButton>
                <IconButton
                  label={
                    template.isFavorite
                      ? 'Hapus dari favorit'
                      : 'Tambah ke favorit'
                  }
                  onClick={() => handleToggleFavorite(template.id)}
                  active={template.isFavorite}
                  tone={template.isFavorite ? 'warning' : 'neutral'}
                >
                  <StarIcon size={14} filled={template.isFavorite} />
                </IconButton>
                {!template.isDefault && (
                  <IconButton
                    label="Jadikan default"
                    onClick={() => handleSetDefault(template.id)}
                  >
                    <CheckIconSmall />
                  </IconButton>
                )}
                <IconButton
                  label="Edit"
                  onClick={() => setEditingTemplate(template)}
                >
                  <PenIcon size={14} />
                </IconButton>
                <IconButton
                  label="Hapus"
                  onClick={() => handleDelete(template.id)}
                  tone="danger"
                >
                  <TrashIcon size={14} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!showForm && !editingTemplate && templates.length > 0 && (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          <PlusIcon size={14} />
          Tambah Template
        </Button>
      )}
    </div>
  );
}

function CheckIconSmall() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  );
}

function IconButton({
  children,
  label,
  onClick,
  tone = 'neutral',
  active = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'neutral' | 'danger' | 'warning';
  active?: boolean;
}) {
  let cls =
    'rounded-sm p-1.5 text-foreground-subtle transition-colors hover:bg-surface-sunken hover:text-foreground';
  if (tone === 'danger') {
    cls =
      'rounded-sm p-1.5 text-foreground-subtle transition-colors hover:bg-danger-soft hover:text-danger';
  } else if (tone === 'warning' && active) {
    cls = 'rounded-sm p-1.5 text-warning transition-colors hover:bg-warning-soft';
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cls}
    >
      {children}
    </button>
  );
}

function PreviewModal({
  template,
  onClose,
}: {
  template: PromptTemplate;
  onClose: () => void;
}) {
  useEscapeKey(onClose);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-md border border-border bg-surface-raised p-6 shadow-md animate-in-pop">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            {template.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1.5 text-foreground-subtle hover:bg-surface-sunken hover:text-foreground"
            aria-label="Tutup"
          >
            <XIcon size={16} />
          </button>
        </div>
        <dl className="space-y-3 text-sm">
          {template.description && (
            <Row label="Deskripsi">{template.description}</Row>
          )}
          {template.category && (
            <Row label="Kategori">{template.category}</Row>
          )}
          {template.platforms.length > 0 && (
            <Row label="Platform">
              <div className="flex flex-wrap gap-1.5">
                {template.platforms.map((p) => (
                  <Badge key={p} tone="info">
                    {platformLabel(p, true)}
                  </Badge>
                ))}
              </div>
            </Row>
          )}
          <Row label="Isi Prompt">
            <pre className="mt-1 max-h-40 overflow-y-auto rounded-sm border border-border bg-surface-sunken p-3 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap">
              {template.promptBody}
            </pre>
          </Row>
          {template.placeholders.length > 0 && (
            <Row label="Placeholder">
              <ul className="mt-1 space-y-1">
                {template.placeholders.map((ph) => (
                  <li
                    key={ph.key}
                    className="flex items-center gap-2 text-xs text-foreground-muted"
                  >
                    <code className="rounded-sm bg-surface-sunken px-1.5 py-0.5">{`{{${ph.key}}}`}</code>
                    <span>{ph.label}</span>
                    {ph.required && (
                      <span className="text-danger">wajib</span>
                    )}
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {template.notes && <Row label="Catatan">{template.notes}</Row>}
          <Row label="Digunakan">{template.usageCount} kali</Row>
        </dl>
        <div className="mt-6">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
        {label}
      </dt>
      <dd className="mt-1 text-foreground-muted">{children}</dd>
    </div>
  );
}
