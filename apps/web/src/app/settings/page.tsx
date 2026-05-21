'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { ProviderList } from './provider-list';
import { ApiTokenList } from './api-tokens';
import { BrandVoiceList } from './brand-voice-list';
import { TemplateList } from './template-list';

type SettingsTab = 'voice' | 'templates' | 'providers' | 'tokens';

const TABS: Array<{
  id: SettingsTab;
  label: string;
  description: string;
  render: () => React.ReactNode;
}> = [
  {
    id: 'voice',
    label: 'Brand Voice',
    description:
      'Profil tone dan gaya penulisan agar konten yang dihasilkan AI tetap konsisten.',
    render: () => <BrandVoiceList />,
  },
  {
    id: 'templates',
    label: 'Prompt Template',
    description:
      'Template prompt yang bisa digunakan ulang. Gunakan placeholder untuk bagian yang berubah.',
    render: () => <TemplateList />,
  },
  {
    id: 'providers',
    label: 'AI Provider',
    description:
      'Konfigurasi provider AI Anda. Mendukung provider yang kompatibel dengan OpenAI API.',
    render: () => <ProviderList />,
  },
  {
    id: 'tokens',
    label: 'API Token',
    description:
      'Token untuk mengakses CaptionSan API dari pipeline atau aplikasi eksternal.',
    render: () => <ApiTokenList />,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('voice');
  const tab = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Pengelolaan"
        title="Pengaturan"
        description="Atur brand voice, template, provider AI, dan akses API."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Pengaturan">
          <ul className="flex flex-row gap-1 overflow-x-auto rounded-md border border-border bg-surface-raised p-1 shadow-xs lg:flex-col">
            {TABS.map((t) => {
              const active = t.id === activeTab;
              return (
                <li key={t.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      'w-full whitespace-nowrap rounded-sm px-3 py-2 text-left text-sm font-medium transition-colors duration-150',
                      active
                        ? 'bg-brand-soft text-brand-soft-foreground'
                        : 'text-foreground-muted hover:bg-surface-sunken hover:text-foreground',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <Card padded className="animate-in-fade">
          <div className="mb-5 border-b border-border pb-4">
            <CardTitle>{tab.label}</CardTitle>
            <CardDescription>{tab.description}</CardDescription>
          </div>
          {tab.render()}
        </Card>
      </div>
    </AppShell>
  );
}
