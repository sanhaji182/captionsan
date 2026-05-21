'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Field, Textarea } from '@/components/ui/input';
import {
  CheckIcon,
  ClipboardIcon,
  EyeIcon,
  HistoryIcon,
  PenIcon,
  SparklesIcon,
} from '@/components/ui/icons';
import { VersionHistory } from './version-history';

interface PlatformOutput {
  id: string;
  generationId: string;
  platform: string;
  tone: string;
  targetLength: number | null;
  characterCount: number;
  contentOriginalAi: string;
  contentCurrent: string;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface OutputCardProps {
  output: PlatformOutput;
  projectId: string;
  platformLabel: string;
  onUpdated: () => void;
}

export function OutputCard({
  output,
  projectId,
  platformLabel,
  onUpdated,
}: OutputCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(output.contentCurrent);
  const [revisionInstruction, setRevisionInstruction] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isApproved = output.approvalStatus === 'approved';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output.contentCurrent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    await apiFetch(`/api/outputs/${output.id}/edit`, {
      method: 'PUT',
      body: JSON.stringify({ content: editContent }),
    });
    setEditing(false);
    setLoading(false);
    onUpdated();
  };

  const handleRevise = async () => {
    if (!revisionInstruction.trim()) return;
    setLoading(true);
    await apiFetch(`/api/outputs/${output.id}/revise`, {
      method: 'POST',
      body: JSON.stringify({ instruction: revisionInstruction }),
    });
    setRevisionInstruction('');
    setShowRevisionForm(false);
    setLoading(false);
    onUpdated();
  };

  const handleApprove = async () => {
    setLoading(true);
    await apiFetch(`/api/outputs/${output.id}/approve`, { method: 'POST' });
    setLoading(false);
    onUpdated();
  };

  return (
    <article className="rounded-md border border-border bg-surface-raised shadow-xs animate-in-fade">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            {platformLabel}
          </h3>
          <span className="text-xs text-foreground-subtle">
            {output.characterCount} karakter
          </span>
          {isApproved && (
            <Badge tone="success" dot>
              Disetujui
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {output.contentOriginalAi !== output.contentCurrent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
            >
              <EyeIcon size={14} />
              {showOriginal ? 'Sembunyikan Asli' : 'Lihat Asli'}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <CheckIcon size={14} />
                Disalin
              </>
            ) : (
              <>
                <ClipboardIcon size={14} />
                Salin
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="px-5 py-4">
        {/* Original AI output for comparison */}
        {showOriginal && output.contentOriginalAi !== output.contentCurrent && (
          <div className="mb-4 rounded-sm border border-border bg-surface-sunken px-4 py-3 animate-in-fade">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
              Output AI Asli
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground-muted">
              {output.contentOriginalAi}
            </p>
          </div>
        )}

        {/* Current content */}
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSaveEdit} loading={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setEditContent(output.contentCurrent);
                }}
              >
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {output.contentCurrent}
          </p>
        )}

        {/* Revision form */}
        {showRevisionForm && !editing && (
          <div className="mt-4 border-t border-border pt-4 animate-in-fade">
            <Field
              label="Instruksi revisi"
              htmlFor={`revise-${output.id}`}
              hint="Contoh: buat lebih singkat, tambah emoji, ubah tone jadi lebih formal."
            >
              <Textarea
                id={`revise-${output.id}`}
                value={revisionInstruction}
                onChange={(e) => setRevisionInstruction(e.target.value)}
                rows={2}
                placeholder="Tulis instruksi revisi..."
              />
            </Field>
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleRevise}
                loading={loading}
                disabled={!revisionInstruction.trim()}
              >
                <SparklesIcon size={14} />
                {loading ? 'Merevisi...' : 'Revisi dengan AI'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRevisionForm(false)}
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      {!editing && !showRevisionForm && (
        <footer className="flex items-center justify-between gap-2 border-t border-border bg-surface px-5 py-3">
          {!isApproved ? (
            <>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  <PenIcon size={14} />
                  Edit Manual
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRevisionForm(true)}
                >
                  <SparklesIcon size={14} />
                  Revisi AI
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <HistoryIcon size={14} />
                  {showHistory ? 'Tutup Riwayat' : 'Riwayat'}
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleApprove}
                  loading={loading}
                >
                  <CheckIcon size={14} />
                  Setujui
                </Button>
              </div>
            </>
          ) : (
            <div className="flex w-full items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <HistoryIcon size={14} />
                {showHistory ? 'Tutup Riwayat' : 'Riwayat'}
              </Button>
            </div>
          )}
        </footer>
      )}

      {/* History */}
      {showHistory && (
        <div className="border-t border-border px-5 py-4 animate-in-fade">
          <VersionHistory
            projectId={projectId}
            entityType="content"
            entityId={output.id}
            canRestore={!isApproved}
            onRestored={onUpdated}
          />
        </div>
      )}
    </article>
  );
}
