'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';
import { PlusIcon, XIcon } from '@/components/ui/icons';
import { PLATFORM_LABELS } from '@/lib/status';
import { cn } from '@/lib/cn';

interface Placeholder {
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
}

interface TemplateFormProps {
  editId?: string;
  initialData?: {
    name: string;
    description?: string | null;
    category?: string | null;
    platforms?: string[];
    promptBody: string;
    placeholders?: Placeholder[];
    notes?: string | null;
    isFavorite?: boolean;
    isDefault?: boolean;
  };
  onSaved: () => void;
  onCancel: () => void;
}

const PLATFORM_OPTIONS = (Object.keys(PLATFORM_LABELS) as string[]).map(
  (value) => ({ value, label: PLATFORM_LABELS[value] }),
);

export function TemplateForm({
  editId,
  initialData,
  onSaved,
  onCancel,
}: TemplateFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(
    initialData?.description || '',
  );
  const [category, setCategory] = useState(initialData?.category || '');
  const [platforms, setPlatforms] = useState<string[]>(
    initialData?.platforms || [],
  );
  const [promptBody, setPromptBody] = useState(initialData?.promptBody || '');
  const [placeholders, setPlaceholders] = useState<Placeholder[]>(
    initialData?.placeholders || [],
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isFavorite, setIsFavorite] = useState(
    initialData?.isFavorite ?? false,
  );
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const togglePlatform = (value: string) => {
    setPlatforms((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    );
  };

  const addPlaceholder = () => {
    setPlaceholders([
      ...placeholders,
      { key: '', label: '', required: false },
    ]);
  };

  const updatePlaceholder = (
    index: number,
    field: keyof Placeholder,
    value: string | boolean,
  ) => {
    const updated = [...placeholders];
    updated[index] = { ...updated[index], [field]: value };
    setPlaceholders(updated);
  };

  const removePlaceholder = (index: number) => {
    setPlaceholders(placeholders.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      name,
      description: description || null,
      category: category || null,
      platforms,
      promptBody,
      placeholders: placeholders.filter((p) => p.key && p.label),
      notes: notes || null,
      isFavorite,
      isDefault,
    };

    const method = editId ? 'PUT' : 'POST';
    const path = editId
      ? `/api/prompt-templates/${editId}`
      : '/api/prompt-templates';

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
        <Field label="Nama Template" htmlFor="templateName">
          <Input
            id="templateName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Contoh: Promo Produk"
          />
        </Field>
        <Field label="Kategori" htmlFor="templateCategory" optional>
          <Input
            id="templateCategory"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="marketing, edukasi, storytelling"
          />
        </Field>
      </div>

      <Field label="Deskripsi" htmlFor="templateDescription" optional>
        <Input
          id="templateDescription"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi singkat tentang template ini"
        />
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">
          Platform Target
        </legend>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((p) => {
            const active = platforms.includes(p.value);
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePlatform(p.value)}
                aria-pressed={active}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                  active
                    ? 'bg-brand text-brand-foreground'
                    : 'bg-surface-sunken text-foreground-muted hover:bg-border hover:text-foreground',
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field
        label="Isi Prompt Template"
        htmlFor="templatePromptBody"
        hint={`Gunakan {{nama_variabel}} untuk placeholder. Contoh: {{produk}}, {{target_audiens}}.`}
      >
        <Textarea
          id="templatePromptBody"
          value={promptBody}
          onChange={(e) => setPromptBody(e.target.value)}
          required
          rows={8}
          className="font-mono text-[13px] leading-relaxed"
          placeholder="Tulis prompt template di sini. Gunakan {{placeholder}} untuk variabel yang bisa diisi nanti."
        />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Placeholder
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addPlaceholder}
          >
            <PlusIcon size={12} />
            Tambah Placeholder
          </Button>
        </div>
        {placeholders.length === 0 ? (
          <p className="text-xs text-foreground-subtle">
            Belum ada placeholder. Tambahkan jika template memiliki variabel.
          </p>
        ) : (
          <ul className="space-y-2">
            {placeholders.map((ph, idx) => (
              <li
                key={idx}
                className="flex flex-wrap items-center gap-2 rounded-sm border border-border bg-surface-raised p-2"
              >
                <Input
                  type="text"
                  value={ph.key}
                  onChange={(e) =>
                    updatePlaceholder(idx, 'key', e.target.value)
                  }
                  placeholder="key"
                  className="h-9 flex-1 min-w-0 text-xs"
                />
                <Input
                  type="text"
                  value={ph.label}
                  onChange={(e) =>
                    updatePlaceholder(idx, 'label', e.target.value)
                  }
                  placeholder="Label"
                  className="h-9 flex-1 min-w-0 text-xs"
                />
                <Input
                  type="text"
                  value={ph.defaultValue || ''}
                  onChange={(e) =>
                    updatePlaceholder(idx, 'defaultValue', e.target.value)
                  }
                  placeholder="Default (opsional)"
                  className="h-9 flex-1 min-w-0 text-xs"
                />
                <label className="flex shrink-0 items-center gap-1 text-xs text-foreground-muted">
                  <input
                    type="checkbox"
                    checked={ph.required || false}
                    onChange={(e) =>
                      updatePlaceholder(idx, 'required', e.target.checked)
                    }
                    className="h-4 w-4 rounded-sm border-border-strong accent-brand"
                  />
                  Wajib
                </label>
                <button
                  type="button"
                  onClick={() => removePlaceholder(idx)}
                  aria-label="Hapus placeholder"
                  className="rounded-sm p-1.5 text-foreground-subtle hover:bg-danger-soft hover:text-danger"
                >
                  <XIcon size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Field label="Catatan" htmlFor="templateNotes" optional>
        <Textarea
          id="templateNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Catatan internal tentang penggunaan template ini"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground-muted">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
            className="h-4 w-4 rounded-sm border-border-strong accent-brand"
          />
          Favorit
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground-muted">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded-sm border-border-strong accent-brand"
          />
          Jadikan default
        </label>
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 border-t border-border pt-4">
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
