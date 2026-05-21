'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HistoryIcon, XIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { useEscapeKey } from '@/lib/use-escape-key';

interface VersionSnapshot {
  id: string;
  entityType: string;
  entityId: string;
  projectId: string;
  versionNumber: number;
  versionLabel: string;
  status: string;
  actorType: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: { old?: number; new?: number };
}

interface VersionHistoryProps {
  projectId: string;
  entityType: 'prompt' | 'content';
  entityId?: string;
  onRestored?: () => void;
  canRestore?: boolean;
}

const ACTOR_LABELS: Record<string, string> = {
  ai: 'AI',
  user: 'Pengguna',
  template: 'Template',
  system: 'Sistem',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  approved: 'Disetujui',
};

export function VersionHistory({
  projectId,
  entityType,
  entityId,
  onRestored,
  canRestore = true,
}: VersionHistoryProps) {
  const [history, setHistory] = useState<VersionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<VersionSnapshot | null>(
    null,
  );
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffLine[] | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const path =
      entityType === 'prompt'
        ? `/api/history/projects/${projectId}/prompt-history`
        : `/api/history/outputs/${entityId}/content-history`;

    const { data } = await apiFetch<{ history: VersionSnapshot[] }>(path);
    if (data) setHistory(data.history);
    setLoading(false);
  }, [projectId, entityType, entityId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCompare = async () => {
    if (!compareA || !compareB) return;
    setDiffLoading(true);
    setError('');

    const { data, error: fetchError } = await apiFetch<{
      versionA: { id: string; versionNumber: number; versionLabel: string };
      versionB: { id: string; versionNumber: number; versionLabel: string };
      diff: DiffLine[];
    }>(`/api/history/versions/compare?a=${compareA}&b=${compareB}`);

    if (fetchError) setError(fetchError);
    else if (data) setDiff(data.diff);
    setDiffLoading(false);
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Restore versi ini? Versi baru akan dibuat.')) return;
    setRestoring(true);
    setError('');

    const path =
      entityType === 'prompt'
        ? `/api/history/projects/${projectId}/prompt-history/restore`
        : `/api/history/outputs/${entityId}/content-history/restore`;

    const { error: fetchError } = await apiFetch(path, {
      method: 'POST',
      body: JSON.stringify({ versionId }),
    });

    if (fetchError) {
      setError(fetchError);
    } else {
      await fetchHistory();
      onRestored?.();
    }
    setRestoring(false);
  };

  useEscapeKey(() => setSelectedVersion(null), !!selectedVersion);

  if (loading) {
    return <p className="text-xs text-foreground-subtle">Memuat riwayat...</p>;
  }

  if (history.length === 0) {
    return (
      <p className="text-xs text-foreground-subtle">
        Belum ada riwayat versi.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <HistoryIcon size={14} className="text-foreground-subtle" />
          Riwayat Versi
          <span className="text-xs font-normal text-foreground-subtle">
            ({history.length})
          </span>
        </h4>
        <Button
          size="sm"
          variant={compareMode ? 'secondary' : 'ghost'}
          onClick={() => {
            setCompareMode(!compareMode);
            setCompareA(null);
            setCompareB(null);
            setDiff(null);
          }}
        >
          {compareMode ? 'Batal Bandingkan' : 'Bandingkan'}
        </Button>
      </div>

      {compareMode && (
        <div className="rounded-sm border border-brand/30 bg-brand-soft/40 px-3 py-2 text-xs text-foreground animate-in-fade">
          Pilih dua versi untuk dibandingkan
          {compareA && ' (A dipilih)'}
          {compareB && ' (B dipilih)'}.
          {compareA && compareB && (
            <Button
              size="sm"
              className="ml-3"
              onClick={handleCompare}
              loading={diffLoading}
            >
              {diffLoading ? 'Memproses...' : 'Lihat Perbedaan'}
            </Button>
          )}
        </div>
      )}

      {diff && (
        <div className="rounded-sm border border-border bg-surface-sunken animate-in-fade">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <h5 className="text-xs font-medium text-foreground">Perbedaan</h5>
            <button
              type="button"
              onClick={() => setDiff(null)}
              className="rounded-sm p-1 text-foreground-subtle hover:bg-surface-raised hover:text-foreground"
              aria-label="Tutup diff"
            >
              <XIcon size={12} />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto px-3 py-2 font-mono text-xs">
            {diff.map((line, idx) => (
              <div
                key={idx}
                className={cn(
                  'px-2 py-0.5',
                  line.type === 'added' && 'bg-success-soft text-success',
                  line.type === 'removed' && 'bg-danger-soft text-danger',
                  line.type === 'unchanged' && 'text-foreground-muted',
                )}
              >
                <span className="inline-block w-4 select-none text-foreground-subtle">
                  {line.type === 'added'
                    ? '+'
                    : line.type === 'removed'
                      ? '-'
                      : ' '}
                </span>
                {line.content || '\u00A0'}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <ol className="space-y-1">
        {history.map((version) => {
          const isSelectedForCompare =
            compareMode && (compareA === version.id || compareB === version.id);
          return (
            <li key={version.id}>
              <button
                type="button"
                onClick={() => {
                  if (compareMode) {
                    if (!compareA) setCompareA(version.id);
                    else if (!compareB && version.id !== compareA)
                      setCompareB(version.id);
                    else if (version.id === compareA) setCompareA(null);
                    else if (version.id === compareB) setCompareB(null);
                  } else {
                    setSelectedVersion(version);
                  }
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm border px-3 py-2 text-left transition-colors duration-150',
                  isSelectedForCompare
                    ? 'border-brand bg-brand-soft/40'
                    : 'border-border hover:bg-surface-sunken',
                )}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-[11px] font-semibold text-foreground-muted"
                  aria-hidden
                >
                  v{version.versionNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {version.versionLabel}
                    </span>
                    <Badge
                      tone={
                        version.status === 'approved' ? 'success' : 'neutral'
                      }
                    >
                      {STATUS_LABELS[version.status] || version.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-foreground-subtle">
                    <span>
                      {ACTOR_LABELS[version.actorType] || version.actorType}
                    </span>
                    <span aria-hidden>·</span>
                    <span>
                      {new Date(version.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Detail modal */}
      {selectedVersion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setSelectedVersion(null)}
            aria-hidden
          />
          <div className="relative z-10 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-md border border-border bg-surface-raised p-6 shadow-md animate-in-pop">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                v{selectedVersion.versionNumber} — {selectedVersion.versionLabel}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedVersion(null)}
                className="rounded-sm p-1.5 text-foreground-subtle hover:bg-surface-sunken hover:text-foreground"
                aria-label="Tutup"
              >
                <XIcon size={16} />
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="font-medium text-foreground-muted">Status:</dt>
                <dd className="text-foreground">
                  {STATUS_LABELS[selectedVersion.status] ||
                    selectedVersion.status}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-foreground-muted">Oleh:</dt>
                <dd className="text-foreground">
                  {ACTOR_LABELS[selectedVersion.actorType] ||
                    selectedVersion.actorType}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-foreground-muted">Waktu:</dt>
                <dd className="text-foreground">
                  {new Date(selectedVersion.createdAt).toLocaleString('id-ID')}
                </dd>
              </div>
              {typeof (selectedVersion.metadata as Record<string, unknown>)
                ?.instructionText === 'string' && (
                <div>
                  <dt className="font-medium text-foreground-muted">
                    Instruksi:
                  </dt>
                  <dd className="mt-0.5 italic text-foreground-muted">
                    &ldquo;
                    {
                      (
                        selectedVersion.metadata as Record<string, string>
                      ).instructionText
                    }
                    &rdquo;
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                Konten
              </p>
              <pre className="mt-1.5 max-h-48 overflow-y-auto rounded-sm border border-border bg-surface-sunken p-3 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                {selectedVersion.content}
              </pre>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              {canRestore &&
                selectedVersion.versionNumber < history[0]?.versionNumber && (
                  <Button
                    onClick={() => {
                      handleRestore(selectedVersion.id);
                      setSelectedVersion(null);
                    }}
                    loading={restoring}
                  >
                    Restore Versi Ini
                  </Button>
                )}
              <Button
                variant="secondary"
                onClick={() => setSelectedVersion(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
