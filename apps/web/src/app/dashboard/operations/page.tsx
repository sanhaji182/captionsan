'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Field, Input, Select } from '@/components/ui/input';
import { ActivityIcon, ChevronRightIcon } from '@/components/ui/icons';
import {
  generationStatusLabel,
  PLATFORM_LABELS,
  platformLabel,
  statusTone,
} from '@/lib/status';

interface SummaryData {
  projects: {
    total: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  generations: {
    total: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  outputs: {
    total: number;
    byPlatform: Array<{ platform: string; count: number }>;
    byApproval: Array<{ status: string; count: number }>;
  };
}

interface JobOutput {
  platform: string;
  approvalStatus: string;
  characterCount: number;
}

interface Job {
  id: string;
  projectId: string;
  projectTitle: string;
  status: string;
  createdAt: string;
  outputs: JobOutput[];
}

interface ActivityItem {
  type: string;
  id: string;
  projectId: string;
  projectTitle: string;
  description: string;
  status: string;
  timestamp: string;
}

export default function OperationsPage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const fetchSummary = useCallback(async () => {
    const { data } = await apiFetch<SummaryData>('/api/operations/summary');
    if (data) setSummary(data);
  }, []);

  const fetchJobs = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    if (filterPlatform) params.set('platform', filterPlatform);
    if (filterDateFrom) params.set('dateFrom', filterDateFrom);
    if (filterDateTo) params.set('dateTo', filterDateTo);

    const { data } = await apiFetch<{ jobs: Job[]; total: number }>(
      `/api/operations/jobs?${params.toString()}`,
    );
    if (data) setJobs(data.jobs);
  }, [filterStatus, filterPlatform, filterDateFrom, filterDateTo]);

  const fetchActivity = useCallback(async () => {
    const { data } = await apiFetch<{ activity: ActivityItem[] }>(
      '/api/operations/activity',
    );
    if (data) setActivity(data.activity);
  }, []);

  useEffect(() => {
    if (session) {
      Promise.all([fetchSummary(), fetchJobs(), fetchActivity()]).then(() =>
        setLoading(false),
      );
    }
  }, [session, fetchSummary, fetchJobs, fetchActivity]);

  useEffect(() => {
    if (session && !loading) fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPlatform, filterDateFrom, filterDateTo]);

  const filtersActive =
    filterStatus || filterPlatform || filterDateFrom || filterDateTo;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Pengelolaan"
        title="Operasional"
        description="Monitor generasi konten dan aktivitas terbaru."
      />

      {loading && !summary ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-md border border-border bg-surface-raised"
            />
          ))}
        </div>
      ) : (
        summary && (
          <section
            aria-label="Ringkasan"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <SummaryCard
              title="Proyek"
              value={summary.projects.total}
              breakdown={summary.projects.byStatus.map((s) => ({
                label: generationStatusLabel(s.status),
                count: s.count,
              }))}
            />
            <SummaryCard
              title="Generasi"
              value={summary.generations.total}
              breakdown={summary.generations.byStatus.map((s) => ({
                label: generationStatusLabel(s.status),
                count: s.count,
              }))}
            />
            <SummaryCard
              title="Output"
              value={summary.outputs.total}
              breakdown={summary.outputs.byPlatform.map((s) => ({
                label: platformLabel(s.platform, true),
                count: s.count,
              }))}
            />
          </section>
        )
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Riwayat Generasi
              </h2>
              <p className="text-xs text-foreground-muted">
                Filter berdasarkan status, platform, atau tanggal.
              </p>
            </div>
            {filtersActive && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilterStatus('');
                  setFilterPlatform('');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}
              >
                Reset filter
              </Button>
            )}
          </div>

          <Card padded className="mb-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Status">
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Semua</option>
                  <option value="completed">Selesai</option>
                  <option value="processing">Memproses</option>
                  <option value="partial">Sebagian</option>
                  <option value="failed">Gagal</option>
                  <option value="queued">Antrian</option>
                </Select>
              </Field>
              <Field label="Platform">
                <Select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                >
                  <option value="">Semua</option>
                  {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Dari tanggal">
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </Field>
              <Field label="Sampai tanggal">
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </Field>
            </div>
          </Card>

          {jobs.length === 0 ? (
            <EmptyState
              icon={<ActivityIcon size={18} />}
              title={
                filtersActive
                  ? 'Tidak ada generasi yang cocok'
                  : 'Belum ada generasi'
              }
              description={
                filtersActive
                  ? 'Coba ubah filter untuk melihat hasil lain.'
                  : 'Generasi konten akan muncul di sini setelah dijalankan.'
              }
            />
          ) : (
            <ul className="space-y-2">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/projects/${job.projectId}`}
                    className="group flex flex-col gap-2 rounded-md border border-border bg-surface-raised px-4 py-3 shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate text-sm font-medium text-foreground">
                        {job.projectTitle}
                      </h3>
                      <Badge tone={statusTone(job.status)} dot>
                        {generationStatusLabel(job.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground-subtle">
                      {new Date(job.createdAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {job.outputs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {job.outputs.map((o, idx) => (
                          <Badge
                            key={idx}
                            tone={statusTone(o.approvalStatus)}
                          >
                            {platformLabel(o.platform, true)}
                            {o.approvalStatus === 'approved' && ' ✓'}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">
              Aktivitas Terbaru
            </h2>
            <p className="text-xs text-foreground-muted">
              Perubahan status terkini.
            </p>
          </div>
          {activity.length === 0 ? (
            <Card padded>
              <p className="text-sm text-foreground-muted">
                Belum ada aktivitas.
              </p>
            </Card>
          ) : (
            <ul className="space-y-2">
              {activity.map((item, idx) => (
                <li key={`${item.type}-${item.id}-${idx}`}>
                  <Link
                    href={`/projects/${item.projectId}`}
                    className="group flex items-start gap-3 rounded-md border border-border bg-surface-raised px-3 py-2.5 shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-border-strong"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">
                        {item.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <Badge tone={statusTone(item.status)}>
                          {generationStatusLabel(item.status)}
                        </Badge>
                        <span className="text-foreground-subtle">
                          {new Date(item.timestamp).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <ChevronRightIcon
                      size={16}
                      className="mt-1 text-foreground-subtle transition-transform duration-150 group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  title,
  value,
  breakdown,
}: {
  title: string;
  value: number;
  breakdown: Array<{ label: string; count: number }>;
}) {
  return (
    <Card padded>
      <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
        {title}
      </p>
      <p className="mt-1.5 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {breakdown.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-border pt-3">
          {breakdown.slice(0, 4).map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-foreground-muted">{item.label}</span>
              <span className="font-medium text-foreground">
                {item.count}
              </span>
            </li>
          ))}
          {breakdown.length > 4 && (
            <li className="text-xs text-foreground-subtle">
              +{breakdown.length - 4} lainnya
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}
