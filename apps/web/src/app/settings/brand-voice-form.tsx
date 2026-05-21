'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';

interface BrandVoiceFormProps {
  editId?: string;
  initialData?: {
    name: string;
    tone: string;
    styleRules?: string | null;
    audience?: string | null;
    bannedWords?: string[];
    ctaPreferences?: string | null;
    languageStyle?: string | null;
    contentLengthGuidance?: string | null;
    isDefault: boolean;
  };
  onSaved: () => void;
  onCancel: () => void;
}

export function BrandVoiceForm({
  editId,
  initialData,
  onSaved,
  onCancel,
}: BrandVoiceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [tone, setTone] = useState(initialData?.tone || '');
  const [styleRules, setStyleRules] = useState(initialData?.styleRules || '');
  const [audience, setAudience] = useState(initialData?.audience || '');
  const [bannedWordsText, setBannedWordsText] = useState(
    (initialData?.bannedWords || []).join(', '),
  );
  const [ctaPreferences, setCtaPreferences] = useState(
    initialData?.ctaPreferences || '',
  );
  const [languageStyle, setLanguageStyle] = useState(
    initialData?.languageStyle || '',
  );
  const [contentLengthGuidance, setContentLengthGuidance] = useState(
    initialData?.contentLengthGuidance || '',
  );
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const bannedWords = bannedWordsText
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    const payload = {
      name,
      tone,
      styleRules: styleRules || null,
      audience: audience || null,
      bannedWords,
      ctaPreferences: ctaPreferences || null,
      languageStyle: languageStyle || null,
      contentLengthGuidance: contentLengthGuidance || null,
      isDefault,
    };

    const method = editId ? 'PUT' : 'POST';
    const path = editId ? `/api/brand-voices/${editId}` : '/api/brand-voices';

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
        <Field label="Nama Profil" htmlFor="voiceName">
          <Input
            id="voiceName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Contoh: Brand Formal"
          />
        </Field>
        <Field label="Tone" htmlFor="voiceTone">
          <Input
            id="voiceTone"
            type="text"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            required
            placeholder="Contoh: profesional, hangat, informatif"
          />
        </Field>
      </div>

      <Field label="Target Audiens" htmlFor="voiceAudience" optional>
        <Input
          id="voiceAudience"
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Contoh: profesional muda usia 25-35"
        />
      </Field>

      <Field
        label="Aturan Gaya Penulisan"
        htmlFor="voiceStyleRules"
        optional
      >
        <Textarea
          id="voiceStyleRules"
          value={styleRules}
          onChange={(e) => setStyleRules(e.target.value)}
          rows={3}
          placeholder="Contoh: Gunakan kalimat pendek. Hindari jargon teknis. Selalu sertakan emoji di awal."
        />
      </Field>

      <Field
        label="Kata yang Dihindari"
        htmlFor="voiceBannedWords"
        optional
        hint="Pisahkan dengan koma."
      >
        <Input
          id="voiceBannedWords"
          type="text"
          value={bannedWordsText}
          onChange={(e) => setBannedWordsText(e.target.value)}
          placeholder="Contoh: murah, gratis, diskon"
        />
      </Field>

      <Field label="Preferensi CTA" htmlFor="voiceCta" optional>
        <Input
          id="voiceCta"
          type="text"
          value={ctaPreferences}
          onChange={(e) => setCtaPreferences(e.target.value)}
          placeholder="Contoh: Selalu akhiri dengan pertanyaan untuk engagement"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Gaya Bahasa" htmlFor="voiceLanguageStyle" optional>
          <Input
            id="voiceLanguageStyle"
            type="text"
            value={languageStyle}
            onChange={(e) => setLanguageStyle(e.target.value)}
            placeholder="Contoh: campuran Indonesia-Inggris"
          />
        </Field>
        <Field
          label="Panduan Panjang Konten"
          htmlFor="voiceLengthGuidance"
          optional
        >
          <Input
            id="voiceLengthGuidance"
            type="text"
            value={contentLengthGuidance}
            onChange={(e) => setContentLengthGuidance(e.target.value)}
            placeholder="Contoh: singkat dan padat, maks 3 paragraf"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground-muted">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 rounded-sm border-border-strong accent-brand"
        />
        Jadikan default
      </label>

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
