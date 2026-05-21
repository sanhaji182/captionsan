'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  ActivityIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  FolderIcon,
  PenIcon,
  PlusIcon,
  SparklesIcon,
} from '@/components/ui/icons';
import { projectStatusLabel, statusTone } from '@/lib/status';

interface Project {
  id: string;
  title: string;
  sourceType: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

const ACTION_STATUSES: Record<string, { label: string; cta: string }> = {
  draft: { label: 'Perlu prompt', cta: 'Generate Prompt' },
  prompt_review: { label: 'Review prompt menunggu', cta: 'Review Prompt' },
  prompt_approved: { label: 'Siap generate konten', cta: 'Generate Konten' },
  generating: { label: 'Sedang generate', cta: 'Lihat Status' },
  content_generating: { label: 'Sedang generate', cta: 'Lihat Status' },
  content_review: { label: 'Review konten menunggu', cta: 'Review Konten' },
  review: { label: 'Review menunggu', cta: 'Review' },
  approved: { label: 'Disetujui', cta: 'Buka' },
  completed: { label: 'Selesai', cta: 'Buka' },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await apiFetch<{ projects: Project[] }>('/api/projects');
      if (data) setProjects(data.projects);
      setLoading(false);
    }
    if (session) fetchProjects();
  }, [session]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 19) return 'Selamat sore';
    return 'Selamat malam';
  })();
  const userName = session?.user.name?.split(' ')[0] ?? 'kamu';

  const reviewable = projects.filter((p) =>
    ['prompt_review', 'content_review', 'review'].includes(p.status),
  );
  const inProgress = projects.filter((p) =>
    [
      'draft',
      'prompt_approved',
      'generating',
      'content_generating',
    ].includes(p.status),
  );
  const completed = projects.filter((p) =>
    ['approved', 'completed'].includes(p.status),
  );

  const recent = [...projects]
    .sort((a, b) => {
      const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
      const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
      return tb - ta;
    })
    .slice(0, 6);

  return (
    <AppShell>
      <PageHeader
        eyebrow={greeting}
        title={`Halo, ${userName}.`}
        description="Mulai dengan ide baru atau lanjutkan proyek yang masih berjalan."
        actions={
          <Link href="/projects/new">
            <Button size="md">
              <PlusIcon size={14} />
              Proyek Baru
            </Button>
          </Link>
        }
      />

      {/* Stat row */}
      <section
        aria-label="Ringkasan"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <StatCard
          icon={<PenIcon size={16} />}
          label="Sedang dikerjakan"
          value={inProgress.length}
          hint={inProgress.length ? 'Lanjutkan progres' : 'Belum ada draft aktif'}
        />
        <StatCard
          icon={<ActivityIcon size={16} />}
          label="Menunggu review"
          value={reviewable.length}
          hint={
            reviewable.length
              ? 'Beri persetujuan untuk lanjut'
              : 'Tidak ada review tertunda'
          }
          tone={reviewable.length ? 'warning' : 'neutral'}
        />
        <StatCard
          icon={<CheckCircleIcon size={16} />}
          label="Selesai"
          value={completed.length}
          hint={completed.length ? 'Konten siap pakai' : 'Belum ada yang disetujui'}
          tone={completed.length ? 'success' : 'neutral'}
        />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending review band */}
        <div className="lg:col-span-2">
          <SectionHeading
            title="Perlu perhatian"
            description="Proyek yang menunggu langkah berikutnya."
            action={
              <Link
                href="/dashboard/reviews"
                className="text-xs font-medium text-foreground-muted hover:text-foreground"
              >
                Lihat semua review
              </Link>
            }
          />

          {loading ? (
            <ProjectSkeleton />
          ) : reviewable.length + inProgress.length === 0 ? (
            <EmptyState
              icon={<SparklesIcon size={18} />}
              title="Belum ada proyek aktif"
              description="Mulai dengan satu ide. CaptionSan akan menyiapkan prompt dan konten untuk semua platform."
              action={
                <Link href="/projects/new">
                  <Button size="md">
                    <PlusIcon size={14} />
                    Buat Proyek Pertama
                  </Button>
                </Link>
              }
            />
          ) : (
            <ul className="space-y-2">
              {[...reviewable, ...inProgress].slice(0, 5).map((p) => (
                <ProjectRow key={p.id} project={p} highlight />
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div>
          <SectionHeading
            title="Aktivitas terbaru"
            description="Proyek yang baru saja diperbarui."
          />
          {loading ? (
            <ProjectSkeleton />
          ) : recent.length === 0 ? (
            <Card padded>
              <p className="text-sm text-foreground-muted">
                Belum ada aktivitas. Buat proyek pertama untuk melihat riwayat di sini.
              </p>
            </Card>
          ) : (
            <ul className="space-y-2">
              {recent.map((p) => (
                <ProjectRow key={p.id} project={p} compact />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* All projects */}
      <section className="mt-10">
        <SectionHeading
          title="Semua proyek"
          description={
            projects.length > 0
              ? `${projects.length} proyek total`
              : undefined
          }
        />
        {loading ? (
          <ProjectSkeleton rows={3} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderIcon size={18} />}
            title="Belum ada proyek"
            description="Setiap proyek dimulai dari satu ide atau draft kasar. CaptionSan akan menyusun prompt, lalu konten untuk semua platform."
            action={
              <Link href="/projects/new">
                <Button>
                  <PlusIcon size={14} />
                  Buat Proyek
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  tone?: 'neutral' | 'warning' | 'success';
}) {
  const accent =
    tone === 'warning'
      ? 'bg-warning-soft text-warning'
      : tone === 'success'
        ? 'bg-success-soft text-success'
        : 'bg-brand-soft text-brand';
  return (
    <Card padded className="flex items-start gap-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${accent}`}
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        {hint && (
          <p className="mt-1 text-xs text-foreground-muted">{hint}</p>
        )}
      </div>
    </Card>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-xs text-foreground-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function ProjectRow({
  project,
  highlight = false,
  compact = false,
}: {
  project: Project;
  highlight?: boolean;
  compact?: boolean;
}) {
  const action = ACTION_STATUSES[project.status];
  return (
    <li>
      <Link
        href={`/projects/${project.id}`}
        className="group flex items-center gap-3 rounded-md border border-border bg-surface-raised px-4 py-3 shadow-xs transition-[border-color,box-shadow,transform] duration-150 ease-out hover:border-border-strong hover:shadow-sm"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium text-foreground">
              {project.title}
            </h3>
            <Badge tone={statusTone(project.status)}>
              {projectStatusLabel(project.status)}
            </Badge>
          </div>
          {!compact && (
            <p className="mt-0.5 text-xs text-foreground-subtle">
              {project.sourceType === 'idea' ? 'Ide' : 'Draft'} ·{' '}
              {new Date(project.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        {highlight && action ? (
          <span className="hidden items-center gap-1 text-xs font-medium text-brand sm:inline-flex">
            {action.cta}
            <ArrowRightIcon
              size={12}
              className="transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </span>
        ) : (
          <ChevronRightIcon
            size={16}
            className="text-foreground-subtle transition-transform duration-150 group-hover:translate-x-0.5"
          />
        )}
      </Link>
    </li>
  );
}

function ProjectSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="h-[58px] animate-pulse rounded-md border border-border bg-surface-raised"
        />
      ))}
    </ul>
  );
}
