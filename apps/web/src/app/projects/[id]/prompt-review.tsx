'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Field, Textarea } from '@/components/ui/input';
import { CheckIcon, SparklesIcon } from '@/components/ui/icons';

interface PromptRevision {
  id: string;
  promptDraftId: string;
  actorType: string;
  instructionText: string;
  resultingPrompt: string;
  createdAt: string;
}

export interface PromptDraft {
  id: string;
  projectId: string;
  promptOriginal: string;
  promptCurrent: string;
  promptApproved: boolean;
  promptStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface PromptReviewProps {
  projectId: string;
  promptDraft: PromptDraft | null;
  revisions: PromptRevision[];
  onPromptApproved: () => void;
  onPromptUpdated: () => void;
}

export function PromptReview({
  projectId,
  promptDraft,
  revisions,
  onPromptApproved,
  onPromptUpdated,
}: PromptReviewProps) {
  const [editText, setEditText] = useState(promptDraft?.promptCurrent || '');
  const [revisionInstruction, setRevisionInstruction] = useState('');
  const [saving, setSaving] = useState(false);
  const [revising, setRevising] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');

  if (!promptDraft) return null;

  const isApproved = promptDraft.promptApproved === true;

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    setError('');

    const { error: fetchError } = await apiFetch(
      `/api/projects/${projectId}/prompt/edit`,
      {
        method: 'PUT',
        body: JSON.stringify({ promptText: editText.trim() }),
      },
    );

    if (fetchError) setError(fetchError);
    else onPromptUpdated();
    setSaving(false);
  };

  const handleRevise = async () => {
    if (!revisionInstruction.trim()) return;
    setRevising(true);
    setError('');

    const { data, error: fetchError } = await apiFetch<{
      promptDraft: PromptDraft;
    }>(`/api/projects/${projectId}/prompt/revise`, {
      method: 'POST',
      body: JSON.stringify({ instruction: revisionInstruction.trim() }),
    });

    if (fetchError) {
      setError(fetchError);
    } else if (data) {
      setEditText(data.promptDraft.promptCurrent);
      setRevisionInstruction('');
      onPromptUpdated();
    }
    setRevising(false);
  };

  const handleApprove = async () => {
    setApproving(true);
    setError('');

    const { error: fetchError } = await apiFetch(
      `/api/projects/${projectId}/prompt/approve`,
      { method: 'POST' },
    );

    if (fetchError) setError(fetchError);
    else onPromptApproved();
    setApproving(false);
  };

  return (
    <Card padded className="mb-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <CardTitle>Prompt yang Dihasilkan</CardTitle>
          <CardDescription>
            Edit langsung atau berikan instruksi revisi sebelum menyetujui.
          </CardDescription>
        </div>
        {isApproved && (
          <Badge tone="success" dot>
            Prompt Disetujui
          </Badge>
        )}
      </div>

      <Field
        label="Prompt"
        htmlFor={`prompt-${projectId}`}
        hint={
          isApproved
            ? 'Prompt sudah disetujui. Buka riwayat untuk restore versi sebelumnya.'
            : 'Edit di bawah, atau gunakan instruksi revisi untuk meminta AI menyesuaikan.'
        }
      >
        <Textarea
          id={`prompt-${projectId}`}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          disabled={isApproved || saving || revising}
          rows={10}
          className="font-mono text-[13px] leading-relaxed"
        />
      </Field>

      {!isApproved && (
        <div className="mt-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveEdit}
            loading={saving}
            disabled={
              saving ||
              revising ||
              approving ||
              editText === promptDraft.promptCurrent
            }
          >
            {saving ? 'Memproses...' : 'Simpan Perubahan'}
          </Button>
        </div>
      )}

      {!isApproved && (
        <div className="mt-6 border-t border-border pt-5">
          <Field
            label="Instruksi Revisi"
            htmlFor={`revise-${projectId}`}
            hint="Contoh: buat lebih konkret, ubah tone jadi lebih hangat, tambahkan CTA."
          >
            <Textarea
              id={`revise-${projectId}`}
              value={revisionInstruction}
              onChange={(e) => setRevisionInstruction(e.target.value)}
              disabled={revising || saving}
              rows={3}
              placeholder="Tulis instruksi untuk merevisi prompt..."
            />
          </Field>
          <div className="mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRevise}
              loading={revising}
              disabled={
                revising || saving || approving || !revisionInstruction.trim()
              }
            >
              <SparklesIcon size={14} />
              {revising ? 'Memproses...' : 'Revisi Prompt'}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {!isApproved && (
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <p className="text-xs text-foreground-muted">
            Setelah disetujui, Anda bisa mulai membuat konten per platform.
          </p>
          <Button
            onClick={handleApprove}
            loading={approving}
            disabled={approving || saving || revising}
            variant="success"
          >
            <CheckIcon size={14} />
            {approving ? 'Memproses...' : 'Setujui Prompt'}
          </Button>
        </div>
      )}

      {revisions.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
            Riwayat Revisi
          </h3>
          <ol className="mt-3 space-y-2">
            {revisions.map((rev) => (
              <li
                key={rev.id}
                className="rounded-sm border border-border bg-surface-sunken px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Badge tone={rev.actorType === 'ai' ? 'info' : 'neutral'}>
                    {rev.actorType === 'ai' ? 'Revisi AI' : 'Edit Manual'}
                  </Badge>
                  <span className="text-xs text-foreground-subtle">
                    {new Date(rev.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="mt-1.5 text-sm italic text-foreground-muted">
                  &ldquo;{rev.instructionText}&rdquo;
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}
