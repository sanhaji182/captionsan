'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ArrowLeftIcon,
  CheckIcon,
  ClipboardIcon,
  LayersIcon,
  SparklesIcon,
} from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import {
  PLATFORM_LABELS,
  platformLabel,
  projectStatusLabel,
  statusTone,
} from '@/lib/status';
import { OutputCard } from './output-card';
import { PromptReview, PromptDraft } from './prompt-review';
import { TemplateSelector } from './template-selector';
import { VersionHistory } from './version-history';

interface Project {
  id: string;
  title: string;
  sourceType: string;
  originalInput: string;
  additionalContext: string | null;
  sourceLanguage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PromptRevision {
  id: string;
  promptDraftId: string;
  actorType: string;
  instructionText: string;
  resultingPrompt: string;
  createdAt: string;
}

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

const PLATFORMS = (Object.keys(PLATFORM_LABELS) as string[]).map((value) => ({
  value,
  label: PLATFORM_LABELS[value],
}));

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [outputs, setOutputs] = useState<PlatformOutput[]>([]);
  const [promptDraft, setPromptDraft] = useState<PromptDraft | null>(null);
  const [promptRevisions, setPromptRevisions] = useState<PromptRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    PLATFORMS.map((p) => p.value),
  );
  const [copiedAll, setCopiedAll] = useState(false);

  const fetchProject = async () => {
    const { data, error: fetchError } = await apiFetch<{ project: Project }>(
      `/api/projects/${id}`,
    );
    if (data) {
      setProject(data.project);
    } else {
      setError(fetchError || 'Failed to load project');
    }
  };

  const fetchOutputs = async () => {
    const { data } = await apiFetch<{ outputs: PlatformOutput[] }>(
      `/api/generations/project/${id}`,
    );
    if (data) setOutputs(data.outputs);
  };

  const fetchPromptDraft = async () => {
    const { data } = await apiFetch<{
      promptDraft: PromptDraft;
      revisions: PromptRevision[];
    }>(`/api/projects/${id}/prompt`);
    if (data) {
      setPromptDraft(data.promptDraft);
      setPromptRevisions(data.revisions);
    }
  };

  useEffect(() => {
    async function load() {
      if (session) {
        await fetchProject();
        await fetchPromptDraft();
        await fetchOutputs();
        setLoading(false);
      }
    }
    load();
  }, [id, session]);

  const handleGeneratePrompt = async () => {
    setGeneratingPrompt(true);
    setError('');

    const { data, error: genError } = await apiFetch<{
      promptDraft: PromptDraft;
    }>(`/api/projects/${id}/prompt/generate`, { method: 'POST' });

    if (genError) {
      setError(genError);
    } else if (data) {
      setPromptDraft(data.promptDraft);
      await fetchProject();
    }
    setGeneratingPrompt(false);
  };

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) return;
    setGenerating(true);
    setError('');

    const { error: genError } = await apiFetch<{
      generation: { status: string };
    }>('/api/generations', {
      method: 'POST',
      body: JSON.stringify({
        projectId: id,
        platforms: selectedPlatforms,
      }),
    });

    if (genError) {
      setError(genError);
    } else {
      await fetchProject();
      await fetchOutputs();
    }
    setGenerating(false);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  };

  const handleCopyAll = async () => {
    const allContent = outputs
      .map((o) => `--- ${platformLabel(o.platform)} ---\n${o.contentCurrent}`)
      .join('\n\n');
    await navigator.clipboard.writeText(allContent);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <div className="h-9 w-48 animate-pulse rounded-sm bg-surface-sunken" />
          <div className="h-32 animate-pulse rounded-md border border-border bg-surface-raised" />
          <div className="h-48 animate-pulse rounded-md border border-border bg-surface-raised" />
        </div>
      </AppShell>
    );
  }

  if (error && !project) {
    return (
      <AppShell>
        <Card padded>
          <p className="text-sm text-danger">{error}</p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block text-sm font-medium text-brand hover:opacity-80"
          >
            Kembali ke dashboard
          </Link>
        </Card>
      </AppShell>
    );
  }

  if (!project) return null;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Proyek"
        title={project.title}
        description={
          project.sourceType === 'idea'
            ? 'Dimulai dari ide utama'
            : 'Dimulai dari draft kasar'
        }
        actions={
          <>
            <Badge tone={statusTone(project.status)} dot>
              {projectStatusLabel(project.status)}
            </Badge>
            <Link href="/dashboard">
              <Button variant="secondary" size="md">
                <ArrowLeftIcon size={14} />
                Kembali
              </Button>
            </Link>
          </>
        }
      />

      {/* Original Input */}
      <Card padded className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
          Input Asli
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {project.originalInput}
        </p>
        {project.additionalContext && (
          <div className="mt-4 border-t border-border pt-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
              Konteks Tambahan
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground-muted">
              {project.additionalContext}
            </p>
          </div>
        )}
      </Card>

      {/* Generate Prompt CTA */}
      {project.status === 'draft' && !promptDraft && (
        <Card padded className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
              aria-hidden
            >
              <SparklesIcon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle>Langkah berikutnya: generate prompt</CardTitle>
              <CardDescription>
                Mulai dari prompt yang bisa di-review dan disesuaikan sebelum
                CaptionSan membuat konten untuk setiap platform.
              </CardDescription>

              {error && (
                <p className="mt-3 text-sm text-danger" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button onClick={handleGeneratePrompt} loading={generatingPrompt}>
                  <SparklesIcon size={14} />
                  {generatingPrompt ? 'Memproses...' : 'Generate Prompt'}
                </Button>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                  Atau gunakan template
                </p>
                <div className="mt-3">
                  <TemplateSelector
                    projectId={id}
                    onTemplateApplied={async (prompt) => {
                      const { data } = await apiFetch<{
                        promptDraft: PromptDraft;
                      }>(`/api/projects/${id}/prompt/apply-template`, {
                        method: 'POST',
                        body: JSON.stringify({ promptText: prompt }),
                      });
                      if (data) {
                        setPromptDraft(data.promptDraft);
                        await fetchProject();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Prompt Review */}
      {promptDraft && (
        <PromptReview
          projectId={id}
          promptDraft={promptDraft}
          revisions={promptRevisions}
          onPromptApproved={async () => {
            await fetchPromptDraft();
            await fetchProject();
          }}
          onPromptUpdated={fetchPromptDraft}
        />
      )}

      {/* Prompt Version History */}
      {promptDraft && (
        <Card padded className="mb-6">
          <VersionHistory
            projectId={id}
            entityType="prompt"
            canRestore={!promptDraft.promptApproved}
            onRestored={fetchPromptDraft}
          />
        </Card>
      )}

      {/* Generation controls */}
      {promptDraft?.promptApproved && outputs.length === 0 && (
        <Card padded className="mb-6">
          <CardTitle>Pilih platform untuk digenerate</CardTitle>
          <CardDescription>
            Tap untuk menyertakan atau mengecualikan platform.
          </CardDescription>

          <div className="mt-4 flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const active = selectedPlatforms.includes(p.value);
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

          {error && (
            <p className="mt-4 text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center gap-2 border-t border-border pt-5">
            <Button
              onClick={handleGenerate}
              loading={generating}
              disabled={selectedPlatforms.length === 0}
            >
              <LayersIcon size={14} />
              {generating ? 'Generating...' : 'Generate Konten'}
            </Button>
            <span className="text-xs text-foreground-subtle">
              {selectedPlatforms.length} platform dipilih
            </span>
          </div>
        </Card>
      )}

      {/* Outputs */}
      {outputs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Output per Platform
              </h2>
              <p className="text-xs text-foreground-muted">
                {outputs.length} output siap di-review.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleCopyAll}>
              {copiedAll ? (
                <>
                  <CheckIcon size={14} />
                  Disalin
                </>
              ) : (
                <>
                  <ClipboardIcon size={14} />
                  Salin Semua
                </>
              )}
            </Button>
          </div>

          {outputs.map((output) => (
            <OutputCard
              key={output.id}
              output={output}
              projectId={id}
              platformLabel={platformLabel(output.platform)}
              onUpdated={fetchOutputs}
            />
          ))}
        </section>
      )}
    </AppShell>
  );
}
