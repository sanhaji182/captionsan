'use client';

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';

export default function DocsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Bantuan"
        title="Dokumentasi"
        description="Panduan lengkap penggunaan CaptionSan — bilingual (Indonesia / English)."
      />

      <article className="prose-captionsan space-y-10">
        {/* 1. What is CaptionSan */}
        <Section id="what-is-captionsan" title="1. Apa itu CaptionSan? / What is CaptionSan?">
          <P>
            CaptionSan adalah aplikasi penulisan konten berbantuan AI yang bilingual. Anda menulis satu ide atau draft kasar, dan CaptionSan menghasilkan konten spesifik per platform untuk Instagram Feed, Instagram Story, Threads, WhatsApp Status, LinkedIn, dan Website.
          </P>
          <P>
            CaptionSan is a bilingual AI-assisted content writing app. You write one idea or rough draft, and CaptionSan generates platform-specific content for 6 platforms. You review, revise, and approve the content before using it.
          </P>
          <H3>Fitur Utama / Key Features</H3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-muted">
            <li><strong>Prompt-first workflow</strong> — AI membuat prompt dulu, Anda review sebelum konten dibuat</li>
            <li><strong>Multi-platform output</strong> — Satu input → 6 format platform</li>
            <li><strong>Free-text revision</strong> — Minta AI revisi dengan instruksi bahasa natural</li>
            <li><strong>Manual editing</strong> — Edit konten langsung kapan saja</li>
            <li><strong>Version history</strong> — Setiap perubahan dilacak dan bisa di-restore</li>
            <li><strong>Brand voice</strong> — Tone konsisten di semua konten</li>
            <li><strong>Prompt templates</strong> — Template yang bisa dipakai ulang dengan placeholder</li>
            <li><strong>n8n integration</strong> — Workflow review eksternal via callback</li>
            <li><strong>API access</strong> — Gunakan CaptionSan dari pipeline atau aplikasi lain</li>
          </ul>
        </Section>

        {/* 2. Getting Started */}
        <Section id="getting-started" title="2. Memulai / Getting Started">
          <H3>Akses / Access</H3>
          <P>
            CaptionSan hanya bisa diakses dengan undangan. Anda butuh link undangan untuk membuat akun.
            CaptionSan is invite-only. You need an invitation link to create an account.
          </P>
          <H3>Menerima Undangan / Accepting an Invitation</H3>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground-muted">
            <li>Buka link undangan yang Anda terima / Open the invitation link you received</li>
            <li>Isi nama dan buat kata sandi (minimal 8 karakter) / Fill in your name and create a password</li>
            <li>Klik <strong>Buat Akun</strong> — Anda akan diarahkan ke dashboard / Click <strong>Buat Akun</strong></li>
          </ol>
          <H3>Masuk / Logging In</H3>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground-muted">
            <li>Buka halaman <Code>/login</Code></li>
            <li>Masukkan email dan kata sandi / Enter your email and password</li>
            <li>Klik <strong>Masuk</strong></li>
          </ol>
        </Section>

        {/* 3. Dashboard */}
        <Section id="dashboard" title="3. Dashboard / Dasbor">
          <P>
            Dashboard adalah layar utama Anda. Menampilkan ringkasan proyek, proyek yang butuh perhatian, dan aktivitas terbaru.
            The dashboard is your home screen showing project summary, items needing attention, and recent activity.
          </P>
          <H3>Navigasi / Navigation</H3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-muted">
            <li><strong>Dashboard</strong> — Layar utama / Home screen</li>
            <li><strong>Operasional</strong> — Monitor generasi / Generation monitoring</li>
            <li><strong>Review</strong> — Riwayat callback dari n8n / Callback history</li>
            <li><strong>Pengaturan</strong> — Brand voice, template, provider, API token</li>
            <li><strong>Dokumentasi</strong> — Halaman ini / This page</li>
          </ul>
        </Section>

        {/* 4. Creating a Project */}
        <Section id="create-project" title="4. Membuat Proyek / Creating a Project">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground-muted">
            <li>Klik <strong>Proyek Baru</strong> di top bar atau dashboard / Click <strong>Proyek Baru</strong></li>
            <li>
              Isi form / Fill in the form:
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li><strong>Judul Proyek</strong> — Nama pendek / Short name</li>
                <li><strong>Tipe Input</strong> — &quot;Ide / Poin Utama&quot; atau &quot;Draft Kasar&quot;</li>
                <li><strong>Ide Utama / Draft Kasar</strong> — Konten utama Anda / Your main content</li>
                <li><strong>Konteks Tambahan</strong> (opsional) — Target audiens, tone, info brand</li>
              </ul>
            </li>
            <li>Klik <strong>Buat Proyek</strong></li>
          </ol>
        </Section>

        {/* 5. Prompt Generation */}
        <Section id="prompt-generation" title="5. Generate & Review Prompt">
          <P>
            CaptionSan menggunakan workflow prompt-first. Sebelum membuat konten, AI membuat prompt yang bisa Anda review dan sesuaikan.
            CaptionSan uses a prompt-first workflow. Before generating content, the AI creates a prompt you can review and adjust.
          </P>
          <H3>Generate Prompt</H3>
          <P>
            Di halaman detail proyek, klik <strong>Generate Prompt</strong>. Atau pilih template dari pemilih template.
            On the project detail page, click <strong>Generate Prompt</strong>. Or choose a template.
          </P>
          <H3>Review & Edit</H3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-muted">
            <li><strong>Edit langsung</strong> — Ubah teks prompt, lalu klik <strong>Simpan Perubahan</strong></li>
            <li><strong>Revisi dengan AI</strong> — Tulis instruksi (misal: &quot;buat lebih konkret&quot;) dan klik <strong>Revisi Prompt</strong></li>
          </ul>
          <H3>Setujui Prompt / Approve Prompt</H3>
          <P>
            Jika sudah puas, klik <strong>Setujui Prompt</strong>. Ini membuka akses untuk generate konten.
            When satisfied, click <strong>Setujui Prompt</strong>. This unlocks content generation.
          </P>
        </Section>

        {/* 6. Content Generation */}
        <Section id="content-generation" title="6. Generate Konten / Content Generation">
          <P>
            Setelah prompt disetujui, pilih platform yang ingin di-generate lalu klik <strong>Generate Konten</strong>.
            After prompt approval, select platforms and click <strong>Generate Konten</strong>.
          </P>
          <H3>Platform yang Didukung / Supported Platforms</H3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-foreground">Platform</th>
                  <th className="pb-2 font-medium text-foreground">Gaya Output / Output Style</th>
                </tr>
              </thead>
              <tbody className="text-foreground-muted">
                <tr className="border-b border-border"><td className="py-2 pr-4">Instagram Feed</td><td className="py-2">Caption menarik, hook, paragraf, CTA, hashtag</td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Instagram Story</td><td className="py-2">Pendek, poin utama saja, teks minimal</td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Threads</td><td className="py-2">Bagian bernomor, percakapan, mudah di-scan</td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">WhatsApp Status</td><td className="py-2">Sangat pendek, natural, tone personal</td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">LinkedIn</td><td className="py-2">Profesional, berbasis insight, CTA jelas</td></tr>
                <tr><td className="py-2 pr-4">Website</td><td className="py-2">Teks lengkap, SEO-friendly, bisa long-form</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 7. Reviewing & Revising */}
        <Section id="review-revise" title="7. Review & Revisi Konten">
          <P>
            Setiap output platform muncul sebagai kartu. Untuk setiap kartu Anda bisa:
            Each platform output appears as a card. For each card you can:
          </P>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-muted">
            <li><strong>Lihat Asli</strong> — Bandingkan dengan output AI asli / Compare with original AI output</li>
            <li><strong>Salin</strong> — Copy ke clipboard / Copy to clipboard</li>
            <li><strong>Edit Manual</strong> — Edit langsung di textarea / Edit directly</li>
            <li><strong>Revisi AI</strong> — Tulis instruksi revisi (misal: &quot;buat lebih singkat&quot;, &quot;tambah emoji&quot;) / Write revision instruction</li>
          </ul>
          <P>Anda bisa revisi sebanyak yang diperlukan. / You can revise as many times as needed.</P>
        </Section>

        {/* 8. Approving & Copying */}
        <Section id="approve-copy" title="8. Menyetujui & Menyalin / Approving & Copying">
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-muted">
            <li>Klik <strong>Setujui</strong> di kartu output ketika konten siap / Click <strong>Setujui</strong> when content is ready</li>
            <li>Setelah disetujui, output terkunci (tidak bisa edit lagi) / After approval, output is locked</li>
            <li>Klik <strong>Salin Semua</strong> untuk menyalin semua output sekaligus / Click <strong>Salin Semua</strong> to copy all outputs</li>
          </ul>
        </Section>

        {/* 9. Version History */}
        <Section id="version-history" title="9. Riwayat Versi / Version History">
          <P>
            Setiap perubahan pada prompt dan konten dilacak secara otomatis.
            Every change to prompts and content is tracked automatically.
          </P>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-muted">
            <li><strong>Lihat riwayat</strong> — Klik &quot;Riwayat&quot; di kartu output atau scroll ke bawah untuk prompt</li>
            <li><strong>Bandingkan</strong> — Pilih dua versi, klik &quot;Lihat Perbedaan&quot; untuk diff view</li>
            <li><strong>Restore</strong> — Klik versi → &quot;Restore Versi Ini&quot; (hanya jika belum disetujui)</li>
          </ul>
        </Section>

        {/* 10. Settings */}
        <Section id="settings" title="10. Pengaturan / Settings">
          <H3>Brand Voice</H3>
          <P>
            Buat profil tone dan gaya penulisan. Set satu sebagai default untuk digunakan otomatis di semua generasi.
            Create tone and writing style profiles. Set one as default for automatic use.
          </P>

          <H3>Prompt Template</H3>
          <P>
            Buat template prompt yang bisa dipakai ulang. Gunakan <Code>{'{{variabel}}'}</Code> untuk placeholder.
            Create reusable prompt templates. Use <Code>{'{{variable}}'}</Code> for placeholders.
          </P>

          <H3>AI Provider</H3>
          <P>
            Konfigurasi koneksi provider AI (BYOK). Mendukung OpenAI, Groq, Together, Ollama, dan provider lain yang kompatibel dengan OpenAI API.
            Configure your AI provider connection (BYOK). Supports any OpenAI-compatible API.
          </P>
          <Callout>
            Klik &quot;Test Koneksi&quot; untuk verifikasi sebelum menyimpan.
            Click &quot;Test Koneksi&quot; to verify before saving.
          </Callout>

          <H3>API Token</H3>
          <P>
            Buat token untuk akses eksternal (pipeline, n8n, script). Token diawali <Code>csan_</Code>. Salin segera — hanya ditampilkan sekali.
            Create tokens for external access. Tokens start with <Code>csan_</Code>. Copy immediately — shown only once.
          </P>
        </Section>

        {/* 11. Operations */}
        <Section id="operations" title="11. Operasional / Operations">
          <P>
            Halaman Operasional menampilkan ringkasan total proyek, generasi, dan output. Anda bisa filter riwayat generasi berdasarkan status, platform, atau tanggal.
            The Operations page shows summary of projects, generations, and outputs. You can filter generation history by status, platform, or date.
          </P>
        </Section>

        {/* 12. n8n */}
        <Section id="n8n" title="12. n8n Review Callbacks">
          <P>
            CaptionSan bisa menerima keputusan review dari n8n via callback API. Alurnya:
            CaptionSan can receive review decisions from n8n via callback API. The flow:
          </P>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground-muted">
            <li>Submit output untuk review via API / Submit output for review via API</li>
            <li>n8n mengirim konten ke reviewer (Slack, email, dll) / n8n routes content to reviewer</li>
            <li>Reviewer memutuskan (approve/reject/revision) / Reviewer decides</li>
            <li>n8n mengirim callback ke CaptionSan / n8n sends callback to CaptionSan</li>
            <li>CaptionSan mengubah status dan mencatat event / CaptionSan updates status</li>
          </ol>
          <Callout>
            Untuk panduan setup lengkap, lihat file <Code>docs/n8n-review-callback/integration-guide.md</Code> di repo.
            For detailed setup instructions, see <Code>docs/n8n-review-callback/integration-guide.md</Code> in the repo.
          </Callout>
        </Section>

        {/* 13. API */}
        <Section id="api" title="13. Akses API / API Access">
          <P>
            CaptionSan memiliki API eksternal stabil di <Code>/v1/*</Code> untuk pipeline dan otomasi.
            CaptionSan has a stable external API at <Code>/v1/*</Code> for pipelines and automation.
          </P>
          <H3>Autentikasi / Authentication</H3>
          <CodeBlock>Authorization: Bearer csan_YOUR_TOKEN</CodeBlock>

          <H3>Endpoint Utama / Key Endpoints</H3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-foreground">Aksi / Action</th>
                  <th className="pb-2 pr-4 font-medium text-foreground">Method</th>
                  <th className="pb-2 font-medium text-foreground">Endpoint</th>
                </tr>
              </thead>
              <tbody className="text-foreground-muted">
                <tr className="border-b border-border"><td className="py-2 pr-4">Daftar proyek</td><td className="py-2 pr-4">GET</td><td className="py-2"><Code>/v1/projects</Code></td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Detail proyek</td><td className="py-2 pr-4">GET</td><td className="py-2"><Code>/v1/projects/:id</Code></td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Buat proyek</td><td className="py-2 pr-4">POST</td><td className="py-2"><Code>/v1/projects</Code></td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Generate konten</td><td className="py-2 pr-4">POST</td><td className="py-2"><Code>/v1/generations</Code></td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Revisi output</td><td className="py-2 pr-4">POST</td><td className="py-2"><Code>/v1/outputs/:id/revise</Code></td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Edit output</td><td className="py-2 pr-4">PUT</td><td className="py-2"><Code>/v1/outputs/:id</Code></td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Setujui output</td><td className="py-2 pr-4">POST</td><td className="py-2"><Code>/v1/outputs/:id/approve</Code></td></tr>
                <tr><td className="py-2 pr-4">Riwayat revisi</td><td className="py-2 pr-4">GET</td><td className="py-2"><Code>/v1/outputs/:id/history</Code></td></tr>
              </tbody>
            </table>
          </div>
          <Callout>
            Untuk dokumentasi API lengkap, lihat file <Code>docs/API.md</Code> di repo.
            For full API documentation, see <Code>docs/API.md</Code> in the repo.
          </Callout>
        </Section>

        {/* 14. Troubleshooting */}
        <Section id="troubleshooting" title="14. Pemecahan Masalah / Troubleshooting">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-foreground">Masalah / Problem</th>
                  <th className="pb-2 font-medium text-foreground">Solusi / Solution</th>
                </tr>
              </thead>
              <tbody className="text-foreground-muted">
                <tr className="border-b border-border"><td className="py-2 pr-4">Tidak bisa masuk</td><td className="py-2">Cek email dan kata sandi. Hanya pengguna yang diundang bisa mengakses.</td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Provider not configured</td><td className="py-2">Buka Pengaturan → AI Provider dan tambahkan API key Anda.</td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Generasi gagal</td><td className="py-2">Cek koneksi provider dengan &quot;Test Koneksi&quot;. Pastikan API key valid dan ada kredit.</td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Konten terlalu panjang/pendek</td><td className="py-2">Gunakan revisi: &quot;buat lebih singkat&quot;. Atau set panduan panjang di Brand Voice.</td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Tone salah</td><td className="py-2">Buat profil Brand Voice dengan tone yang benar dan set sebagai default.</td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">Tidak bisa edit konten yang disetujui</td><td className="py-2">Konten yang disetujui terkunci. Gunakan riwayat versi untuk restore versi sebelumnya.</td></tr>
                <tr className="border-b border-border"><td className="py-2 pr-4">API returns 401</td><td className="py-2">Token tidak valid. Buat yang baru di Pengaturan → API Token.</td></tr>
                <tr><td className="py-2 pr-4">n8n callback returns 409</td><td className="py-2">Output tidak dalam status yang benar. Submit untuk review dulu.</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 15. Running Locally */}
        <Section id="running-locally" title="15. Menjalankan Lokal / Running Locally">
          <H3>Dengan Docker (disarankan) / With Docker (recommended)</H3>
          <CodeBlock>docker compose up</CodeBlock>
          <P>
            Ini menjalankan PostgreSQL (port 5432), API (port 3001, auto-migrasi), dan Web (port 3000).
            This starts PostgreSQL (port 5432), API (port 3001, auto-migration), and Web (port 3000).
          </P>

          <H3>Tanpa Docker / Without Docker</H3>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground-muted">
            <li>Jalankan PostgreSQL dan set <Code>DATABASE_URL</Code> di <Code>.env</Code></li>
            <li>Jalankan migrasi: <Code>pnpm db:push</Code></li>
            <li>Jalankan API: <Code>cd apps/api && pnpm dev</Code></li>
            <li>Jalankan web: <Code>cd apps/web && pnpm dev</Code></li>
          </ol>

          <H3>Setup Pertama Kali / First-time Setup</H3>
          <P>
            Setelah menjalankan app, buat user pertama via endpoint setup:
            After starting the app, create the first user via the setup endpoint:
          </P>
          <CodeBlock>{`curl -X POST http://localhost:3001/api/setup/init \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@captionsan.id","password":"your-password","name":"Admin"}'`}</CodeBlock>
          <P>Lalu masuk di <Code>http://localhost:3000/login</Code>.</P>
        </Section>
      </article>
    </AppShell>
  );
}

// ─── Typography Components ───────────────────────────────────────────────────

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-4 border-b border-border pb-3 text-lg font-semibold text-foreground">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-5 text-sm font-semibold text-foreground">{children}</h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-foreground-muted">{children}</p>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-sm border border-border bg-surface-sunken px-4 py-3 font-mono text-xs leading-relaxed text-foreground">
      {children}
    </pre>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-brand/20 bg-brand-soft/40 px-4 py-3 text-sm text-foreground-muted">
      💡 {children}
    </div>
  );
}
