'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api';
import { OutputCard } from './output-card';

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

const PLATFORMS = [
  { value: 'instagram_feed', label: 'Instagram Feed' },
  { value: 'instagram_story', label: 'Instagram Story' },
  { value: 'threads', label: 'Threads' },
  { value: 'whatsapp_status', label: 'WhatsApp Status' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'website', label: 'Website' },
];

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isPending: sessionPending } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [outputs, setOutputs] = useState<PlatformOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    PLATFORMS.map((p) => p.value)
  );

  const fetchProject = async () => {
    const { data, error: fetchError } = await apiFetch<{ project: Project }>(
      `/api/projects/${id}`
    );
    if (data) {
      setProject(data.project);
    } else {
      setError(fetchError || 'Failed to load project');
    }
  };

  const fetchOutputs = async () => {
    const { data } = await apiFetch<{ outputs: PlatformOutput[] }>(
      `/api/generations/project/${id}`
    );
    if (data) {
      setOutputs(data.outputs);
    }
  };

  useEffect(() => {
    async function load() {
      if (session) {
        await fetchProject();
        await fetchOutputs();
        setLoading(false);
      }
    }
    load();
  }, [id, session]);

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) return;
    setGenerating(true);

    const { data, error: genError } = await apiFetch<{ generation: { status: string } }>(
      '/api/generations',
      {
        method: 'POST',
        body: JSON.stringify({
          projectId: id,
          platforms: selectedPlatforms,
        }),
      }
    );

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
        : [...prev, platform]
    );
  };

  if (sessionPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </main>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  if (error && !project) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <p className="text-red-600">{error}</p>
        <a href="/dashboard" className="text-sm text-gray-500 hover:underline mt-2 inline-block">
          Kembali ke dashboard
        </a>
      </main>
    );
  }

  if (!project) return null;

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    generating: 'Sedang Generate',
    review: 'Review',
    approved: 'Disetujui',
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500">
              {project.sourceType === 'idea' ? 'Ide' : 'Draft'}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {statusLabels[project.status] || project.status}
            </span>
          </div>
        </div>
        <a
          href="/dashboard"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
        >
          Kembali
        </a>
      </header>

      {/* Original Input */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-2">Input Asli</h2>
        <p className="whitespace-pre-wrap text-sm">{project.originalInput}</p>
        {project.additionalContext && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-400 mb-1">Konteks Tambahan</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-600">
              {project.additionalContext}
            </p>
          </div>
        )}
      </section>

      {/* Generation Controls */}
      {outputs.length === 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-5 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Pilih Platform</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => togglePlatform(p.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedPlatforms.includes(p.value)
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={generating || selectedPlatforms.length === 0}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {generating ? 'Generating...' : 'Generate Konten'}
          </button>
        </section>
      )}

      {/* Platform Outputs */}
      {outputs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Output per Platform</h2>
            <button
              onClick={() => {
                const allContent = outputs
                  .map((o) => {
                    const label = PLATFORMS.find((p) => p.value === o.platform)?.label || o.platform;
                    return `--- ${label} ---\n${o.contentCurrent}`;
                  })
                  .join('\n\n');
                navigator.clipboard.writeText(allContent);
              }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors"
            >
              Salin Semua
            </button>
          </div>

          {outputs.map((output) => (
            <OutputCard
              key={output.id}
              output={output}
              platformLabel={
                PLATFORMS.find((p) => p.value === output.platform)?.label || output.platform
              }
              onUpdated={fetchOutputs}
            />
          ))}
        </section>
      )}
    </main>
  );
}
