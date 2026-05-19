'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api';

interface Project {
  id: string;
  title: string;
  sourceType: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await apiFetch<{ projects: Project[] }>('/api/projects');
      if (data) {
        setProjects(data.projects);
      }
      setLoadingProjects(false);
    }
    if (session) {
      fetchProjects();
    }
  }, [session]);

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </main>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    generating: 'Generating',
    review: 'Review',
    approved: 'Disetujui',
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <a
            href="/settings"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
          >
            Pengaturan
          </a>
          <button
            onClick={() => signOut().then(() => (window.location.href = '/login'))}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Proyek</h2>
        <a
          href="/projects/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          + Proyek Baru
        </a>
      </div>

      {loadingProjects ? (
        <p className="text-sm text-gray-500">Memuat proyek...</p>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500 mb-4">Belum ada proyek.</p>
          <a
            href="/projects/new"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Buat Proyek Pertama
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <a
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {project.sourceType === 'idea' ? 'Ide' : 'Draft'} ·{' '}
                    {new Date(project.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {statusLabels[project.status] || project.status}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
