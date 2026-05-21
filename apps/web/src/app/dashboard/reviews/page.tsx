'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckCircleIcon, MessageIcon } from '@/components/ui/icons';
import { approvalStatusLabel, statusTone } from '@/lib/status';
import { cn } from '@/lib/cn';

interface ReviewEvent {
  id: string;
  platformOutputId: string;
  externalJobId: string | null;
  previousStatus: string;
  newStatus: string;
  reviewerIdentifier: string | null;
  notes: string | null;
  source: string;
  applied: string;
  rejectionReason: string | null;
  providerPayload: Record<string, unknown> | null;
  createdAt: string;
}

const APPLIED_LABELS: Record<string, string> = {
  success: 'Berhasil',
  rejected: 'Ditolak',
  duplicate: 'Duplikat',
};

const APPLIED_TONES: Record<string, 'success' | 'danger' | 'warning'> = {
  success: 'success',
  rejected: 'danger',
  duplicate: 'warning',
};

export default function ReviewsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<ReviewEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ReviewEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    const { data } = await apiFetch<{ events: ReviewEvent[] }>(
      '/api/review-callbacks/events',
    );
    if (data) setEvents(data.events);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) fetchEvents();
  }, [session, fetchEvents]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Pengelolaan"
        title="Review Callbacks"
        description="Riwayat callback review dari n8n dan sistem eksternal."
      />

      {loading ? (
        <ul className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="h-20 animate-pulse rounded-md border border-border bg-surface-raised"
            />
          ))}
        </ul>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<MessageIcon size={18} />}
          title="Belum ada callback review"
          description="Callback akan muncul di sini saat n8n atau sistem eksternal mengirim hasil review."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <ul className="space-y-2">
              {events.map((event) => {
                const active = selectedEvent?.id === event.id;
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className={cn(
                        'w-full rounded-md border px-4 py-3 text-left shadow-xs transition-[border-color,box-shadow] duration-150',
                        active
                          ? 'border-brand bg-brand-soft/40 ring-2 ring-brand/20'
                          : 'border-border bg-surface-raised hover:border-border-strong',
                      )}
                      aria-pressed={active}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge tone={statusTone(event.newStatus)} dot>
                            {approvalStatusLabel(event.newStatus)}
                          </Badge>
                          <span className="text-xs text-foreground-subtle">
                            dari {approvalStatusLabel(event.previousStatus)}
                          </span>
                        </div>
                        <Badge
                          tone={
                            APPLIED_TONES[event.applied] ?? 'neutral'
                          }
                        >
                          {APPLIED_LABELS[event.applied] || event.applied}
                        </Badge>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-foreground-subtle">
                        <span>
                          {new Date(event.createdAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {event.source && <span>· {event.source}</span>}
                        {event.reviewerIdentifier && (
                          <span>· {event.reviewerIdentifier}</span>
                        )}
                      </div>

                      {event.notes && (
                        <p className="mt-2 line-clamp-2 text-sm text-foreground-muted">
                          {event.notes}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside>
            {selectedEvent ? (
              <Card padded className="sticky top-20 animate-in-fade">
                <h3 className="text-sm font-semibold text-foreground">
                  Detail Callback
                </h3>

                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="Status Transisi">
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge tone={statusTone(selectedEvent.previousStatus)}>
                        {approvalStatusLabel(selectedEvent.previousStatus)}
                      </Badge>
                      <span aria-hidden className="text-foreground-subtle">
                        →
                      </span>
                      <Badge tone={statusTone(selectedEvent.newStatus)}>
                        {approvalStatusLabel(selectedEvent.newStatus)}
                      </Badge>
                    </div>
                  </Row>

                  <Row label="Hasil">
                    <Badge
                      tone={
                        APPLIED_TONES[selectedEvent.applied] ?? 'neutral'
                      }
                    >
                      {APPLIED_LABELS[selectedEvent.applied] ||
                        selectedEvent.applied}
                    </Badge>
                  </Row>

                  {selectedEvent.rejectionReason && (
                    <Row label="Alasan Ditolak">
                      <span className="text-danger">
                        {selectedEvent.rejectionReason}
                      </span>
                    </Row>
                  )}

                  <Row label="Sumber">{selectedEvent.source}</Row>

                  {selectedEvent.reviewerIdentifier && (
                    <Row label="Reviewer">
                      {selectedEvent.reviewerIdentifier}
                    </Row>
                  )}

                  {selectedEvent.externalJobId && (
                    <Row label="External Job ID">
                      <span className="break-all font-mono text-xs text-foreground-muted">
                        {selectedEvent.externalJobId}
                      </span>
                    </Row>
                  )}

                  {selectedEvent.notes && (
                    <Row label="Catatan Reviewer">
                      <span className="whitespace-pre-wrap text-foreground-muted">
                        {selectedEvent.notes}
                      </span>
                    </Row>
                  )}

                  <Row label="Output ID">
                    <span className="break-all font-mono text-xs text-foreground-muted">
                      {selectedEvent.platformOutputId}
                    </span>
                  </Row>

                  <Row label="Waktu">
                    {new Date(selectedEvent.createdAt).toLocaleString(
                      'id-ID',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      },
                    )}
                  </Row>

                  {selectedEvent.providerPayload && (
                    <Row label="Payload">
                      <pre className="mt-1 max-h-40 overflow-auto rounded-sm border border-border bg-surface-sunken p-2 font-mono text-xs text-foreground-muted">
                        {JSON.stringify(
                          selectedEvent.providerPayload,
                          null,
                          2,
                        )}
                      </pre>
                    </Row>
                  )}
                </dl>
              </Card>
            ) : (
              <Card padded className="sticky top-20">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
                    aria-hidden
                  >
                    <CheckCircleIcon size={16} />
                  </div>
                  <p className="text-sm text-foreground-muted">
                    Pilih callback dari daftar untuk melihat detail lengkap.
                  </p>
                </div>
              </Card>
            )}
          </aside>
        </div>
      )}
    </AppShell>
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
      <dd className="mt-1 text-foreground">{children}</dd>
    </div>
  );
}
