import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, SparklesIcon } from '@/components/ui/icons';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--color-brand) 8%, transparent) 0%, transparent 70%)',
        }}
      />

      <div className="flex w-full max-w-xl flex-col items-center text-center animate-in-fade">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-medium text-foreground-muted shadow-xs">
          <SparklesIcon size={12} className="text-brand" />
          Akses berdasarkan undangan
        </span>

        <h1 className="display mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Satu ide. Semua platform.
        </h1>
        <p className="mt-4 max-w-md text-base text-foreground-muted">
          CaptionSan mengubah satu ide atau draft kasar menjadi konten siap pakai
          untuk Instagram, Threads, WhatsApp, LinkedIn, dan website Anda.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link href="/login">
            <Button size="lg">
              Masuk
              <ArrowRightIcon size={14} />
            </Button>
          </Link>
        </div>

        <p className="mt-12 text-xs text-foreground-subtle">
          Bilingual · Indonesian default · BYOK AI
        </p>
      </div>
    </main>
  );
}
