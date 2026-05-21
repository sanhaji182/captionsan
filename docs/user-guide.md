# CaptionSan — User Guide / Panduan Pengguna

---

## Table of Contents / Daftar Isi

1. [What is CaptionSan? / Apa itu CaptionSan?](#1-what-is-captionsan--apa-itu-captionsan)
2. [Getting Started / Memulai](#2-getting-started--memulai)
3. [Dashboard / Dasbor](#3-dashboard--dasbor)
4. [Creating a Project / Membuat Proyek](#4-creating-a-project--membuat-proyek)
5. [Prompt Generation & Review / Generate & Review Prompt](#5-prompt-generation--review--generate--review-prompt)
6. [Content Generation / Generate Konten](#6-content-generation--generate-konten)
7. [Reviewing & Revising Content / Review & Revisi Konten](#7-reviewing--revising-content--review--revisi-konten)
8. [Approving & Copying / Menyetujui & Menyalin](#8-approving--copying--menyetujui--menyalin)
9. [Version History / Riwayat Versi](#9-version-history--riwayat-versi)
10. [Settings / Pengaturan](#10-settings--pengaturan)
11. [Operations / Operasional](#11-operations--operasional)
12. [n8n Review Callbacks](#12-n8n-review-callbacks)
13. [API Access / Akses API](#13-api-access--akses-api)
14. [Troubleshooting / Pemecahan Masalah](#14-troubleshooting--pemecahan-masalah)

---

## 1. What is CaptionSan? / Apa itu CaptionSan?

**English:** CaptionSan is a bilingual AI-assisted content writing app. You write one idea or rough draft, and CaptionSan generates platform-specific content for Instagram Feed, Instagram Story, Threads, WhatsApp Status, LinkedIn, and Website. You review, revise, and approve the content before using it.

**Indonesia:** CaptionSan adalah aplikasi penulisan konten berbantuan AI yang bilingual. Anda menulis satu ide atau draft kasar, dan CaptionSan menghasilkan konten spesifik per platform untuk Instagram Feed, Instagram Story, Threads, WhatsApp Status, LinkedIn, dan Website. Anda review, revisi, dan setujui konten sebelum digunakan.

### Key Features / Fitur Utama

| Feature / Fitur | Description / Keterangan |
|-----------------|--------------------------|
| Prompt-first workflow | AI generates a prompt first, you review it before content is created / AI membuat prompt dulu, Anda review sebelum konten dibuat |
| Multi-platform output | One input → 6 platform formats / Satu input → 6 format platform |
| Free-text revision | Ask AI to revise with natural language instructions / Minta AI revisi dengan instruksi bahasa natural |
| Manual editing | Edit content directly at any time / Edit konten langsung kapan saja |
| Version history | Every change is tracked and restorable / Setiap perubahan dilacak dan bisa di-restore |
| Brand voice | Consistent tone across all content / Tone konsisten di semua konten |
| Prompt templates | Reusable templates with placeholders / Template yang bisa dipakai ulang dengan placeholder |
| n8n integration | External review workflow via callbacks / Workflow review eksternal via callback |
| API access | Use CaptionSan from pipelines or other apps / Gunakan CaptionSan dari pipeline atau aplikasi lain |

---

## 2. Getting Started / Memulai

### Access / Akses

CaptionSan is invite-only. You need an invitation link to create an account.
CaptionSan hanya bisa diakses dengan undangan. Anda butuh link undangan untuk membuat akun.

### Accepting an Invitation / Menerima Undangan

1. Open the invitation link you received (e.g., `https://app.captionsan.id/invite/abc123`).
   Buka link undangan yang Anda terima.

2. Fill in your name and create a password (minimum 8 characters).
   Isi nama dan buat kata sandi (minimal 8 karakter).

3. Click **Buat Akun** — you'll be redirected to the dashboard.
   Klik **Buat Akun** — Anda akan diarahkan ke dashboard.

### Logging In / Masuk

1. Go to `/login`.
   Buka `/login`.

2. Enter your email and password.
   Masukkan email dan kata sandi.

3. Click **Masuk**.
   Klik **Masuk**.

---

## 3. Dashboard / Dasbor

The dashboard is your home screen. It shows:
Dashboard adalah layar utama Anda. Menampilkan:

- **Stat cards** — How many projects are in progress, waiting review, or completed.
  **Kartu statistik** — Berapa proyek sedang dikerjakan, menunggu review, atau selesai.

- **Perlu perhatian** — Projects that need your next action (review prompt, generate content, etc).
  **Perlu perhatian** — Proyek yang butuh langkah berikutnya dari Anda.

- **Aktivitas terbaru** — Recently updated projects.
  **Aktivitas terbaru** — Proyek yang baru diperbarui.

- **Semua proyek** — Full list of all your projects.
  **Semua proyek** — Daftar lengkap semua proyek Anda.

### Navigation / Navigasi

The sidebar (desktop) or hamburger menu (mobile) gives you access to:
Sidebar (desktop) atau menu hamburger (mobile) memberi akses ke:

- **Dashboard** — Home screen / Layar utama
- **Operasional** — Generation monitoring / Monitor generasi
- **Review** — Callback history from n8n / Riwayat callback dari n8n
- **Pengaturan** — Brand voice, templates, providers, API tokens

---

## 4. Creating a Project / Membuat Proyek

### Steps / Langkah

1. Click **Proyek Baru** (top bar or dashboard).
   Klik **Proyek Baru** (top bar atau dashboard).

2. Fill in:
   Isi:
   - **Judul Proyek** — A short name for this content project.
     **Judul Proyek** — Nama pendek untuk proyek konten ini.
   - **Tipe Input** — Choose "Ide / Poin Utama" or "Draft Kasar".
     **Tipe Input** — Pilih "Ide / Poin Utama" atau "Draft Kasar".
   - **Ide Utama / Draft Kasar** — Your main content or idea.
     **Ide Utama / Draft Kasar** — Konten utama atau ide Anda.
   - **Konteks Tambahan** (optional) — Target audience, tone, brand info.
     **Konteks Tambahan** (opsional) — Target audiens, tone, info brand.

3. Click **Buat Proyek**.
   Klik **Buat Proyek**.

You'll be taken to the project detail page.
Anda akan diarahkan ke halaman detail proyek.

---

## 5. Prompt Generation & Review / Generate & Review Prompt

CaptionSan uses a **prompt-first workflow**. Before generating content, the AI creates a prompt that you can review and adjust.

CaptionSan menggunakan **workflow prompt-first**. Sebelum membuat konten, AI membuat prompt yang bisa Anda review dan sesuaikan.

### Generate Prompt / Generate Prompt

1. On the project detail page, click **Generate Prompt**.
   Di halaman detail proyek, klik **Generate Prompt**.

2. Or choose a **template** from the template selector below.
   Atau pilih **template** dari pemilih template di bawah.

### Review & Edit Prompt / Review & Edit Prompt

Once generated, you can:
Setelah di-generate, Anda bisa:

- **Edit directly** — Change the prompt text in the textarea, then click **Simpan Perubahan**.
  **Edit langsung** — Ubah teks prompt di textarea, lalu klik **Simpan Perubahan**.

- **Revise with AI** — Write an instruction (e.g., "buat lebih konkret", "tambahkan CTA") and click **Revisi Prompt**.
  **Revisi dengan AI** — Tulis instruksi (misal: "buat lebih konkret", "tambahkan CTA") dan klik **Revisi Prompt**.

### Approve Prompt / Setujui Prompt

When you're satisfied, click **Setujui Prompt**. This unlocks content generation.
Jika sudah puas, klik **Setujui Prompt**. Ini membuka akses untuk generate konten.

> ⚠️ After approval, the prompt is locked. Use version history to restore a previous version if needed.
> ⚠️ Setelah disetujui, prompt terkunci. Gunakan riwayat versi untuk restore versi sebelumnya jika perlu.

---

## 6. Content Generation / Generate Konten

### Select Platforms / Pilih Platform

After prompt approval, you'll see platform selection pills:
Setelah prompt disetujui, Anda akan melihat pill pemilihan platform:

- Instagram Feed
- Instagram Story
- Threads (auto-numbered / otomatis bernomor)
- WhatsApp Status
- LinkedIn
- Website

Tap to include/exclude platforms. All are selected by default.
Tap untuk menyertakan/mengecualikan platform. Semua dipilih secara default.

### Generate / Generate

Click **Generate Konten**. The AI will create content tailored to each platform's style:
Klik **Generate Konten**. AI akan membuat konten yang disesuaikan dengan gaya tiap platform:

| Platform | Style / Gaya |
|----------|-------------|
| Instagram Feed | Engaging caption, strong hook, hashtags |
| Instagram Story | Short, main point only |
| Threads | Numbered parts, conversational |
| WhatsApp Status | Very short, personal tone |
| LinkedIn | Professional, insight-driven |
| Website | Full text, SEO-friendly |

---

## 7. Reviewing & Revising Content / Review & Revisi Konten

Each platform output appears as a card. For each card you can:
Setiap output platform muncul sebagai kartu. Untuk setiap kartu Anda bisa:

### View Original / Lihat Asli

Click **Lihat Asli** to compare the current version with the original AI output.
Klik **Lihat Asli** untuk membandingkan versi saat ini dengan output AI asli.

### Copy / Salin

Click **Salin** to copy the current content to clipboard.
Klik **Salin** untuk menyalin konten saat ini ke clipboard.

### Edit Manually / Edit Manual

1. Click **Edit Manual**.
   Klik **Edit Manual**.
2. Make your changes in the textarea.
   Buat perubahan di textarea.
3. Click **Simpan Perubahan**.
   Klik **Simpan Perubahan**.

### Revise with AI / Revisi dengan AI

1. Click **Revisi AI**.
   Klik **Revisi AI**.
2. Write your instruction in natural language (e.g., "buat lebih singkat", "tambah emoji", "ubah tone jadi lebih formal").
   Tulis instruksi dalam bahasa natural (misal: "buat lebih singkat", "tambah emoji", "ubah tone jadi lebih formal").
3. Click **Revisi dengan AI**.
   Klik **Revisi dengan AI**.

You can revise as many times as needed.
Anda bisa revisi sebanyak yang diperlukan.

---

## 8. Approving & Copying / Menyetujui & Menyalin

### Approve / Setujui

Click **Setujui** on each output card when the content is ready.
Klik **Setujui** di setiap kartu output ketika konten sudah siap.

Once approved, the output is locked (no more edits or revisions). You can still view history and copy.
Setelah disetujui, output terkunci (tidak bisa edit atau revisi lagi). Anda masih bisa lihat riwayat dan salin.

### Copy All / Salin Semua

Click **Salin Semua** at the top of the outputs section to copy all platform outputs at once, formatted with platform headers.
Klik **Salin Semua** di atas bagian output untuk menyalin semua output platform sekaligus, diformat dengan header platform.

---

## 9. Version History / Riwayat Versi

Every change to prompts and content is tracked automatically.
Setiap perubahan pada prompt dan konten dilacak secara otomatis.

### Viewing History / Melihat Riwayat

- For prompts: scroll down on the project page to see the version history section.
  Untuk prompt: scroll ke bawah di halaman proyek untuk melihat bagian riwayat versi.

- For outputs: click **Riwayat** on any output card.
  Untuk output: klik **Riwayat** di kartu output mana saja.

### Comparing Versions / Membandingkan Versi

1. Click **Bandingkan**.
   Klik **Bandingkan**.
2. Select two versions (A and B).
   Pilih dua versi (A dan B).
3. Click **Lihat Perbedaan** to see a diff view.
   Klik **Lihat Perbedaan** untuk melihat tampilan diff.

### Restoring a Version / Restore Versi

Click on a version → in the detail modal, click **Restore Versi Ini**. A new version will be created from the restored content.
Klik versi → di modal detail, klik **Restore Versi Ini**. Versi baru akan dibuat dari konten yang di-restore.

> Note: You can only restore versions if the content is not yet approved.
> Catatan: Anda hanya bisa restore versi jika konten belum disetujui.

---

## 10. Settings / Pengaturan

Access via the sidebar → **Pengaturan**. There are four sections:
Akses via sidebar → **Pengaturan**. Ada empat bagian:

### Brand Voice

Create profiles to keep AI output consistent with your brand tone.
Buat profil untuk menjaga output AI konsisten dengan tone brand Anda.

Fields:
- **Nama Profil** — e.g., "Brand Formal", "Casual Fun"
- **Tone** — e.g., "profesional, hangat, informatif"
- **Target Audiens** — e.g., "profesional muda usia 25-35"
- **Aturan Gaya** — Writing rules for the AI
- **Kata yang Dihindari** — Words the AI should not use
- **Preferensi CTA** — How to end content
- **Gaya Bahasa** — e.g., "campuran Indonesia-Inggris"
- **Panduan Panjang** — e.g., "singkat dan padat, maks 3 paragraf"

Set one as **Default** — it will be used automatically for all generations.
Set satu sebagai **Default** — akan digunakan otomatis untuk semua generasi.

### Prompt Template

Create reusable prompt templates with placeholders.
Buat template prompt yang bisa dipakai ulang dengan placeholder.

- Use `{{variable_name}}` syntax for dynamic parts.
  Gunakan sintaks `{{nama_variabel}}` untuk bagian dinamis.
- Assign templates to specific platforms.
  Tetapkan template ke platform tertentu.
- Mark favorites and defaults.
  Tandai favorit dan default.

### AI Provider

Configure your AI provider connection (BYOK — Bring Your Own Key).
Konfigurasi koneksi provider AI Anda (BYOK — Bring Your Own Key).

- **Nama Provider** — e.g., "OpenAI", "Groq", "Together AI"
- **Base URL** — e.g., `https://api.openai.com/v1`
- **Model** — e.g., `gpt-4o-mini`, `llama-3.1-70b`
- **API Key** — Your provider API key (stored encrypted)

Click **Test Koneksi** to verify before saving.
Klik **Test Koneksi** untuk verifikasi sebelum menyimpan.

> ⚠️ CaptionSan supports any OpenAI-compatible API (OpenAI, Groq, Together, Ollama, etc).
> ⚠️ CaptionSan mendukung API yang kompatibel dengan OpenAI (OpenAI, Groq, Together, Ollama, dll).

### API Token

Create tokens for external access (pipelines, n8n, scripts).
Buat token untuk akses eksternal (pipeline, n8n, script).

- Tokens start with `csan_` prefix.
  Token diawali dengan prefix `csan_`.
- Copy immediately after creation — shown only once.
  Salin segera setelah dibuat — hanya ditampilkan sekali.
- Delete a token to revoke access instantly.
  Hapus token untuk mencabut akses secara instan.

---

## 11. Operations / Operasional

Access via sidebar → **Operasional**.
Akses via sidebar → **Operasional**.

This page shows:
Halaman ini menampilkan:

- **Summary cards** — Total projects, generations, and outputs with status breakdown.
  **Kartu ringkasan** — Total proyek, generasi, dan output dengan breakdown status.

- **Generation history** — All AI generation jobs with filters (status, platform, date range).
  **Riwayat generasi** — Semua job generasi AI dengan filter (status, platform, rentang tanggal).

- **Recent activity** — Latest status changes across all projects.
  **Aktivitas terbaru** — Perubahan status terkini di semua proyek.

---

## 12. n8n Review Callbacks

Access via sidebar → **Review**.
Akses via sidebar → **Review**.

This page shows all review callbacks received from n8n or external systems.
Halaman ini menampilkan semua callback review yang diterima dari n8n atau sistem eksternal.

### How it works / Cara kerjanya

1. Submit an output for external review via API.
   Submit output untuk review eksternal via API.

2. n8n routes the content to a reviewer.
   n8n mengirim konten ke reviewer.

3. Reviewer decides (approve/reject/revision).
   Reviewer memutuskan (setujui/tolak/revisi).

4. n8n sends the result back to CaptionSan.
   n8n mengirim hasilnya kembali ke CaptionSan.

5. CaptionSan updates the status and records the event.
   CaptionSan mengubah status dan mencatat event.

For detailed setup instructions, see:
Untuk instruksi setup detail, lihat:

📄 **`docs/n8n-review-callback/integration-guide.md`**

---

## 13. API Access / Akses API

CaptionSan has a stable external API at `/v1/*` for use in pipelines and automation.
CaptionSan memiliki API eksternal stabil di `/v1/*` untuk digunakan di pipeline dan otomasi.

### Authentication / Autentikasi

```
Authorization: Bearer csan_YOUR_TOKEN
```

### Key Endpoints / Endpoint Utama

| Action / Aksi | Method | Endpoint |
|---------------|--------|----------|
| List projects / Daftar proyek | GET | `/v1/projects` |
| Get project detail / Detail proyek | GET | `/v1/projects/:id` |
| Create project / Buat proyek | POST | `/v1/projects` |
| Generate content / Generate konten | POST | `/v1/generations` |
| Revise output / Revisi output | POST | `/v1/outputs/:id/revise` |
| Edit output / Edit output | PUT | `/v1/outputs/:id` |
| Approve output / Setujui output | POST | `/v1/outputs/:id/approve` |
| Get revision history / Riwayat revisi | GET | `/v1/outputs/:id/history` |

### Quick Example / Contoh Cepat

```bash
# Create project / Buat proyek
curl -X POST http://localhost:3001/v1/projects \
  -H "Authorization: Bearer csan_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Promo Akhir Tahun",
    "sourceType": "idea",
    "originalInput": "Diskon 50% semua produk sampai 31 Desember"
  }'

# Generate content / Generate konten
curl -X POST http://localhost:3001/v1/generations \
  -H "Authorization: Bearer csan_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "PROJECT_ID",
    "platforms": ["instagram_feed", "threads", "linkedin"]
  }'

# Revise / Revisi
curl -X POST http://localhost:3001/v1/outputs/OUTPUT_ID/revise \
  -H "Authorization: Bearer csan_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"instruction": "Buat lebih singkat dan tambahkan emoji"}'

# Approve / Setujui
curl -X POST http://localhost:3001/v1/outputs/OUTPUT_ID/approve \
  -H "Authorization: Bearer csan_YOUR_TOKEN"
```

For full API documentation, see:
Untuk dokumentasi API lengkap, lihat:

📄 **`docs/API.md`**

---

## 14. Troubleshooting / Pemecahan Masalah

| Problem / Masalah | Solution / Solusi |
|---------|----------|
| Can't log in / Tidak bisa masuk | Check email and password. Only invited users can access. / Cek email dan kata sandi. Hanya pengguna yang diundang bisa mengakses. |
| "Provider not configured" | Go to Settings → AI Provider and add your API key. / Buka Pengaturan → AI Provider dan tambahkan API key Anda. |
| Generation fails / Generasi gagal | Check your provider connection with "Test Koneksi". Verify API key is valid and has credits. / Cek koneksi provider dengan "Test Koneksi". Pastikan API key valid dan ada kredit. |
| Content too long/short / Konten terlalu panjang/pendek | Use revision: "buat lebih singkat" or "buat lebih detail". Or set content length guidance in Brand Voice. / Gunakan revisi: "buat lebih singkat" atau "buat lebih detail". Atau set panduan panjang di Brand Voice. |
| Wrong tone / Tone salah | Create a Brand Voice profile with the correct tone and set it as default. / Buat profil Brand Voice dengan tone yang benar dan set sebagai default. |
| Can't edit approved content / Tidak bisa edit konten yang disetujui | Approved content is locked. Use version history to restore a previous version, which creates a new draft. / Konten yang disetujui terkunci. Gunakan riwayat versi untuk restore versi sebelumnya, yang membuat draft baru. |
| API returns 401 | Your token is invalid or expired. Create a new one in Settings → API Token. / Token Anda tidak valid atau kedaluwarsa. Buat yang baru di Pengaturan → API Token. |
| n8n callback returns 409 | The output is not in the correct state. Submit for review first. / Output tidak dalam status yang benar. Submit untuk review dulu. |

---

## Running Locally / Menjalankan Secara Lokal

### With Docker (recommended) / Dengan Docker (disarankan)

```bash
docker compose up
```

This starts:
Ini menjalankan:
- **PostgreSQL** on port 5432
- **API** on port 3001 (auto-runs migrations)
- **Web** on port 3000

Open `http://localhost:3000` in your browser.
Buka `http://localhost:3000` di browser Anda.

### Without Docker / Tanpa Docker

1. Start PostgreSQL and set `DATABASE_URL` in `.env`.
   Jalankan PostgreSQL dan set `DATABASE_URL` di `.env`.

2. Run migrations:
   Jalankan migrasi:
   ```bash
   pnpm db:push
   ```

3. Start the API:
   Jalankan API:
   ```bash
   cd apps/api && pnpm dev
   ```

4. Start the web app:
   Jalankan web app:
   ```bash
   cd apps/web && pnpm dev
   ```

### First-time Setup / Setup Pertama Kali

After starting the app, you need to create the first user. Use the setup endpoint:
Setelah menjalankan app, Anda perlu membuat user pertama. Gunakan endpoint setup:

```bash
curl -X POST http://localhost:3001/api/setup/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@captionsan.id",
    "password": "your-secure-password",
    "name": "Admin"
  }'
```

Then log in at `http://localhost:3000/login`.
Lalu masuk di `http://localhost:3000/login`.

To invite other users, use the invitation system (coming from the admin or via API).
Untuk mengundang user lain, gunakan sistem undangan (dari admin atau via API).

---

## Supported Platforms / Platform yang Didukung

| Platform | Output Style / Gaya Output |
|----------|---------------------------|
| Instagram Feed | Engaging caption with hook, paragraphs, CTA, hashtags / Caption menarik dengan hook, paragraf, CTA, hashtag |
| Instagram Story | Short, main point only, minimal text / Pendek, poin utama saja, teks minimal |
| Threads | Numbered parts, conversational, easy to scan / Bagian bernomor, percakapan, mudah di-scan |
| WhatsApp Status | Very short, natural, personal tone / Sangat pendek, natural, tone personal |
| LinkedIn | Professional, insight-driven, clear CTA / Profesional, berbasis insight, CTA jelas |
| Website | Full text, SEO-friendly, can be long-form / Teks lengkap, SEO-friendly, bisa long-form |

---

*Last updated: May 2026*
*Terakhir diperbarui: Mei 2026*
