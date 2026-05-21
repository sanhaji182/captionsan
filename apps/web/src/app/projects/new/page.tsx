'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input, Textarea } from '@/components/ui/input';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

type SourceType = 'idea' | 'draft';

export default function NewProjectPage() {
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('idea');
  const [originalInput, setOriginalInput] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { data, error: fetchError } = await apiFetch<{
      project: { id: string };
    }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        title,
        sourceType,
        originalInput,
        additionalContext: additionalContext || undefined,
      }),
    });

    if (fetchError) {
      setError(fetchError);
      setSubmitting(false);
    } else if (data) {
      window.location.href = `/projects/${data.project.id}`;
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Proyek"
        title="Proyek Baru"
        description="Mulai dari satu ide atau draft kasar. CaptionSan akan menyiapkan prompt sebelum membuat konten."
        actions={
          <Link href="/dashboard">
            <Button variant="secondary" size="md">
              <ArrowLeftIcon size={14} />
              Kembali
            </Button>
          </Link>
        }
      />

      <Card padded>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Judul Proyek" htmlFor="title">
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Contoh: Promo Akhir Tahun"
            />
          </Field>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">
              Tipe Input
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SourceCard
                active={sourceType === 'idea'}
                title="Ide / Poin Utama"
                description="Beberapa kalimat poin yang ingin disampaikan."
                onClick={() => setSourceType('idea')}
              />
              <SourceCard
                active={sourceType === 'draft'}
                title="Draft Kasar"
                description="Tulisan kasar yang ingin dirapikan untuk berbagai platform."
                onClick={() => setSourceType('draft')}
              />
            </div>
          </fieldset>

          <Field
            label={sourceType === 'idea' ? 'Ide Utama' : 'Draft Kasar'}
            htmlFor="originalInput"
          >
            <Textarea
              id="originalInput"
              value={originalInput}
              onChange={(e) => setOriginalInput(e.target.value)}
              required
              rows={8}
              placeholder={
                sourceType === 'idea'
                  ? 'Tulis ide utama atau poin-poin yang ingin disampaikan...'
                  : 'Tulis draft kasar konten Anda di sini...'
              }
            />
          </Field>

          <Field
            label="Konteks Tambahan"
            htmlFor="additionalContext"
            optional
            hint="Target audiens, tone yang diinginkan, atau informasi brand."
          >
            <Textarea
              id="additionalContext"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
              placeholder="Target audiens, tone yang diinginkan, informasi brand, dll."
            />
          </Field>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
            <Link href="/dashboard">
              <Button variant="ghost" type="button">
                Batal
              </Button>
            </Link>
            <Button type="submit" loading={submitting}>
              {submitting ? 'Membuat proyek...' : 'Buat Proyek'}
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}

function SourceCard({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-md border bg-surface-raised p-4 text-left transition-[border-color,box-shadow] duration-150 ease-out',
        active
          ? 'border-brand ring-2 ring-brand/20'
          : 'border-border hover:border-border-strong',
      )}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-foreground-muted">{description}</p>
    </button>
  );
}
