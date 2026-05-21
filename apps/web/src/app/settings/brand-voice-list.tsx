'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  EyeIcon,
  MicIcon,
  PenIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from '@/components/ui/icons';
import { BrandVoiceForm } from './brand-voice-form';
import { useEscapeKey } from '@/lib/use-escape-key';

interface BrandVoice {
  id: string;
  name: string;
  tone: string;
  styleRules: string | null;
  audience: string | null;
  bannedWords: string[];
  ctaPreferences: string | null;
  languageStyle: string | null;
  contentLengthGuidance: string | null;
  isDefault: boolean;
  createdAt: string;
}

export function BrandVoiceList() {
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVoice, setEditingVoice] = useState<BrandVoice | null>(null);
  const [previewVoice, setPreviewVoice] = useState<BrandVoice | null>(null);

  const fetchVoices = useCallback(async () => {
    setLoading(true);
    const { data } = await apiFetch<{ brandVoices: BrandVoice[] }>(
      '/api/brand-voices',
    );
    if (data) setVoices(data.brandVoices);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus brand voice ini?')) return;
    await apiFetch(`/api/brand-voices/${id}`, { method: 'DELETE' });
    fetchVoices();
  };

  const handleSetDefault = async (id: string) => {
    await apiFetch(`/api/brand-voices/${id}/default`, { method: 'POST' });
    fetchVoices();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingVoice(null);
    fetchVoices();
  };

  if (loading) {
    return <p className="text-sm text-foreground-muted">Memuat...</p>;
  }

  return (
    <div className="space-y-4">
      {previewVoice && (
        <PreviewModal voice={previewVoice} onClose={() => setPreviewVoice(null)} />
      )}

      {(showForm || editingVoice) && (
        <div className="rounded-md border border-border bg-surface-sunken/40 p-4 animate-in-fade">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {editingVoice ? 'Edit Brand Voice' : 'Tambah Brand Voice'}
          </h3>
          <BrandVoiceForm
            editId={editingVoice?.id}
            initialData={
              editingVoice
                ? {
                    name: editingVoice.name,
                    tone: editingVoice.tone,
                    styleRules: editingVoice.styleRules,
                    audience: editingVoice.audience,
                    bannedWords: editingVoice.bannedWords,
                    ctaPreferences: editingVoice.ctaPreferences,
                    languageStyle: editingVoice.languageStyle,
                    contentLengthGuidance: editingVoice.contentLengthGuidance,
                    isDefault: editingVoice.isDefault,
                  }
                : undefined
            }
            onSaved={handleSaved}
            onCancel={() => {
              setShowForm(false);
              setEditingVoice(null);
            }}
          />
        </div>
      )}

      {voices.length === 0 && !showForm && !editingVoice && (
        <EmptyState
          icon={<MicIcon size={18} />}
          title="Belum ada brand voice"
          description="Buat profil brand voice untuk menjaga konsistensi tone dan gaya penulisan di semua konten."
          action={
            <Button onClick={() => setShowForm(true)}>
              <PlusIcon size={14} />
              Tambah Brand Voice
            </Button>
          }
        />
      )}

      {voices.length > 0 && (
        <ul className="space-y-2">
          {voices.map((voice) => (
            <li
              key={voice.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface-raised px-4 py-3 shadow-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-medium text-foreground">
                    {voice.name}
                  </h4>
                  {voice.isDefault && <Badge tone="success">Default</Badge>}
                </div>
                <p className="mt-0.5 truncate text-xs text-foreground-muted">
                  Tone: {voice.tone}
                </p>
                {voice.audience && (
                  <p className="mt-0.5 truncate text-xs text-foreground-subtle">
                    Audiens: {voice.audience}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <IconButton
                  label="Preview"
                  onClick={() => setPreviewVoice(voice)}
                >
                  <EyeIcon size={14} />
                </IconButton>
                {!voice.isDefault && (
                  <IconButton
                    label="Jadikan default"
                    onClick={() => handleSetDefault(voice.id)}
                  >
                    <StarIcon size={14} />
                  </IconButton>
                )}
                <IconButton
                  label="Edit"
                  onClick={() => setEditingVoice(voice)}
                >
                  <PenIcon size={14} />
                </IconButton>
                <IconButton
                  label="Hapus"
                  onClick={() => handleDelete(voice.id)}
                  tone="danger"
                >
                  <TrashIcon size={14} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!showForm && !editingVoice && voices.length > 0 && (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          <PlusIcon size={14} />
          Tambah Brand Voice
        </Button>
      )}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={
        tone === 'danger'
          ? 'rounded-sm p-1.5 text-foreground-subtle transition-colors hover:bg-danger-soft hover:text-danger'
          : 'rounded-sm p-1.5 text-foreground-subtle transition-colors hover:bg-surface-sunken hover:text-foreground'
      }
    >
      {children}
    </button>
  );
}

function PreviewModal({
  voice,
  onClose,
}: {
  voice: BrandVoice;
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
            {voice.name}
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
          <PreviewRow label="Tone">{voice.tone}</PreviewRow>
          {voice.audience && (
            <PreviewRow label="Target Audiens">{voice.audience}</PreviewRow>
          )}
          {voice.styleRules && (
            <PreviewRow label="Aturan Gaya" multiline>
              {voice.styleRules}
            </PreviewRow>
          )}
          {voice.bannedWords && voice.bannedWords.length > 0 && (
            <PreviewRow label="Kata yang Dihindari">
              {voice.bannedWords.join(', ')}
            </PreviewRow>
          )}
          {voice.ctaPreferences && (
            <PreviewRow label="Preferensi CTA">
              {voice.ctaPreferences}
            </PreviewRow>
          )}
          {voice.languageStyle && (
            <PreviewRow label="Gaya Bahasa">{voice.languageStyle}</PreviewRow>
          )}
          {voice.contentLengthGuidance && (
            <PreviewRow label="Panduan Panjang">
              {voice.contentLengthGuidance}
            </PreviewRow>
          )}
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

function PreviewRow({
  label,
  children,
  multiline = false,
}: {
  label: string;
  children: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
        {label}
      </dt>
      <dd
        className={
          multiline
            ? 'mt-1 whitespace-pre-wrap text-foreground-muted'
            : 'mt-1 text-foreground-muted'
        }
      >
        {children}
      </dd>
    </div>
  );
}
