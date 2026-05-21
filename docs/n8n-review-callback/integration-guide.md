# n8n Review Callback — Integration Guide

# Panduan Integrasi n8n Review Callback

---

## Overview / Ringkasan

CaptionSan can receive review decisions from n8n (or any external system) via a callback API. This allows you to build review workflows where content is routed to reviewers via Slack, email, or custom forms — and the result is sent back to CaptionSan automatically.

CaptionSan bisa menerima keputusan review dari n8n (atau sistem eksternal lainnya) melalui callback API. Ini memungkinkan Anda membangun workflow review di mana konten dikirim ke reviewer via Slack, email, atau form kustom — dan hasilnya dikirim balik ke CaptionSan secara otomatis.

---

## Architecture / Arsitektur

```
┌─────────────┐         ┌─────────┐         ┌─────────────┐
│ CaptionSan  │────────▶│   n8n   │────────▶│  Reviewer   │
│ (source of  │         │(workflow)│         │  (human or  │
│   truth)    │◀────────│         │◀────────│   system)   │
└─────────────┘         └─────────┘         └─────────────┘
```

### Flow / Alur

1. **Submit for review** — CaptionSan marks output as `in_review`.
   **Kirim untuk review** — CaptionSan menandai output sebagai `in_review`.

2. **Route to reviewer** — n8n sends content to the reviewer (Slack, email, etc).
   **Kirim ke reviewer** — n8n mengirim konten ke reviewer (Slack, email, dll).

3. **Review decision** — Reviewer approves, rejects, or requests revision.
   **Keputusan review** — Reviewer menyetujui, menolak, atau meminta revisi.

4. **Callback** — n8n sends POST to CaptionSan with the result.
   **Callback** — n8n mengirim POST ke CaptionSan dengan hasilnya.

5. **Update** — CaptionSan validates, updates status, and records audit history.
   **Update** — CaptionSan memvalidasi, mengubah status, dan mencatat riwayat audit.

---

## Prerequisites / Prasyarat

- CaptionSan API running (default: `http://localhost:3001`)
  CaptionSan API berjalan (default: `http://localhost:3001`)

- An API token created from **Settings → API Token** in the CaptionSan dashboard.
  Sebuah API token yang dibuat dari **Pengaturan → API Token** di dashboard CaptionSan.

- At least one platform output generated (you need the `outputId`).
  Minimal satu platform output sudah di-generate (Anda butuh `outputId`).

---

## Step 1: Create an API Token / Buat API Token

Go to the CaptionSan dashboard → **Pengaturan** → **API Token** → click **Buat Token**.

Buka dashboard CaptionSan → **Pengaturan** → **API Token** → klik **Buat Token**.

You'll receive a token like:
Anda akan mendapat token seperti:

```
csan_a1b2c3d4e5f6789...
```

> ⚠️ **Save this immediately.** The token is only shown once.
> ⚠️ **Simpan segera.** Token hanya ditampilkan sekali.

---

## Step 2: Submit Output for Review / Kirim Output untuk Review

Before n8n can send a callback, the output must be in `in_review` status.
Sebelum n8n bisa mengirim callback, output harus berstatus `in_review`.

### Endpoint

```
POST /api/review-callbacks/submit-for-review
```

### Headers

```
Authorization: Bearer csan_YOUR_TOKEN
Content-Type: application/json
```

### Body

```json
{
  "outputId": "your-platform-output-uuid"
}
```

### Example / Contoh

```bash
curl -X POST http://localhost:3001/api/review-callbacks/submit-for-review \
  -H "Authorization: Bearer csan_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"outputId": "550e8400-e29b-41d4-a716-446655440000"}'
```

### Response

```json
{
  "success": true,
  "output": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "platform": "instagram_feed",
    "approvalStatus": "in_review"
  },
  "event": { "id": "event-uuid" }
}
```

---

## Step 3: Configure n8n Workflow / Konfigurasi Workflow n8n

### Recommended n8n Workflow Structure / Struktur Workflow n8n yang Disarankan

```
[Webhook Trigger] → [Format Message] → [Send to Reviewer] → [Wait for Response] → [HTTP Request to CaptionSan]
```

### n8n HTTP Request Node Configuration / Konfigurasi Node HTTP Request n8n

| Setting | Value |
|---------|-------|
| Method | `POST` |
| URL | `http://YOUR_API_HOST:3001/api/review-callbacks` |
| Authentication | Header Auth |
| Header Name | `Authorization` |
| Header Value | `Bearer csan_YOUR_TOKEN` |
| Body Content Type | JSON |

### Body to send / Body yang dikirim

```json
{
  "outputId": "{{ $json.outputId }}",
  "status": "{{ $json.reviewDecision }}",
  "externalJobId": "{{ $execution.id }}",
  "reviewerIdentifier": "{{ $json.reviewerEmail }}",
  "notes": "{{ $json.reviewerNotes }}"
}
```

---

## Step 4: Callback Endpoint Reference / Referensi Endpoint Callback

### Endpoint

```
POST /api/review-callbacks
```

### Headers

```
Authorization: Bearer csan_YOUR_TOKEN
Content-Type: application/json
```

### Request Body

| Field | Required / Wajib | Type | Description / Keterangan |
|-------|:---:|------|------------|
| `outputId` | ✅ | string (UUID) | Platform output ID to review / ID platform output yang di-review |
| `status` | ✅ | string | `approved`, `rejected`, or `revision_requested` |
| `externalJobId` | ❌ | string | n8n execution ID for tracking / ID eksekusi n8n untuk tracking |
| `reviewerIdentifier` | ❌ | string | Who reviewed (email, name) / Siapa yang review (email, nama) |
| `notes` | ❌ | string | Reviewer feedback / Catatan dari reviewer |
| `providerPayload` | ❌ | object | Raw payload for debugging / Payload mentah untuk debugging |

### Example Request / Contoh Request

```bash
curl -X POST http://localhost:3001/api/review-callbacks \
  -H "Authorization: Bearer csan_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outputId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "approved",
    "externalJobId": "n8n-exec-abc123",
    "reviewerIdentifier": "reviewer@company.com",
    "notes": "Konten sudah bagus, siap publish."
  }'
```

---

## Step 5: Handle Responses / Tangani Response

### Success (200) / Berhasil (200)

```json
{
  "success": true,
  "event": {
    "id": "event-uuid",
    "applied": "success",
    "previousStatus": "in_review",
    "newStatus": "approved"
  },
  "output": {
    "id": "output-uuid",
    "platform": "instagram_feed",
    "approvalStatus": "approved",
    "updatedAt": "2026-05-21T08:30:00.000Z"
  }
}
```

### Duplicate (200) / Duplikat (200)

If the output already has the same status, the callback is recorded but no change is made. This makes the endpoint idempotent.

Jika output sudah memiliki status yang sama, callback tetap dicatat tapi tidak ada perubahan. Ini membuat endpoint idempotent.

```json
{
  "success": true,
  "duplicate": true,
  "event": { "id": "event-uuid", "applied": "duplicate" },
  "output": { "id": "output-uuid", "approvalStatus": "approved" }
}
```

### Invalid Transition (409) / Transisi Tidak Valid (409)

If the status transition is not allowed (e.g., trying to approve a `draft` output that hasn't been submitted for review).

Jika transisi status tidak diizinkan (misal, mencoba approve output `draft` yang belum di-submit untuk review).

```json
{
  "error": "Invalid state transition: draft → approved",
  "event": { "id": "event-uuid", "applied": "rejected" }
}
```

### Validation Error (400)

```json
{ "error": "outputId is required" }
```

### Not Found (404)

```json
{ "error": "Output not found" }
```

---

## Valid State Transitions / Transisi Status yang Valid

```
draft ──────────────────▶ in_review
draft ──────────────────▶ approved (manual, tanpa n8n)

in_review ──────────────▶ approved
in_review ──────────────▶ rejected
in_review ──────────────▶ revision_requested

revision_requested ─────▶ draft (user revisi konten)
revision_requested ─────▶ in_review (submit ulang)

rejected ───────────────▶ draft (user revisi konten)
rejected ───────────────▶ in_review (submit ulang)
```

### Diagram

```
         ┌──────────────────────────────────────────┐
         │                                          │
         ▼                                          │
      ┌──────┐    submit    ┌───────────┐           │
      │ draft │────────────▶│ in_review │           │
      └──────┘              └───────────┘           │
         ▲                    │  │  │               │
         │                    │  │  │               │
         │         ┌──────────┘  │  └──────────┐    │
         │         ▼             ▼              ▼    │
         │    ┌──────────┐  ┌──────────┐  ┌────────────────────┐
         │    │ approved  │  │ rejected │  │ revision_requested │
         │    └──────────┘  └──────────┘  └────────────────────┘
         │                       │                  │
         │                       │                  │
         └───────────────────────┴──────────────────┘
                        (user revises)
```

---

## Viewing Callback History / Melihat Riwayat Callback

All callbacks are recorded and visible in the CaptionSan dashboard at:
Semua callback tercatat dan bisa dilihat di dashboard CaptionSan di:

**Dashboard → Review** (`/dashboard/reviews`)

You can see:
Anda bisa melihat:

- Status transition (before → after) / Transisi status (sebelum → sesudah)
- Who reviewed / Siapa yang review
- Reviewer notes / Catatan reviewer
- Whether the callback was applied, rejected, or duplicate / Apakah callback diterapkan, ditolak, atau duplikat
- Timestamp / Waktu
- Raw payload from n8n / Payload mentah dari n8n

---

## API: List Callback Events / API: Daftar Event Callback

### Get all events for current user / Ambil semua event untuk user saat ini

```
GET /api/review-callbacks/events
Authorization: Bearer csan_YOUR_TOKEN
```

### Get events for a specific output / Ambil event untuk output tertentu

```
GET /api/review-callbacks/:outputId
Authorization: Bearer csan_YOUR_TOKEN
```

---

## Complete Example Workflow / Contoh Workflow Lengkap

### 1. Generate content / Generate konten

Create a project, generate prompt, approve prompt, generate content.
Buat proyek, generate prompt, setujui prompt, generate konten.

### 2. Get the output ID / Dapatkan output ID

From the project detail page or via API response after generation.
Dari halaman detail proyek atau dari response API setelah generasi.

### 3. Submit for review / Kirim untuk review

```bash
curl -X POST http://localhost:3001/api/review-callbacks/submit-for-review \
  -H "Authorization: Bearer csan_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"outputId": "OUTPUT_ID"}'
```

### 4. n8n picks up the content and routes to reviewer
### n8n mengambil konten dan mengirim ke reviewer

(Configure your n8n workflow to poll or receive webhook for `in_review` outputs.)
(Konfigurasi workflow n8n Anda untuk polling atau menerima webhook untuk output `in_review`.)

### 5. Reviewer decides / Reviewer memutuskan

### 6. n8n sends callback / n8n mengirim callback

```bash
curl -X POST http://localhost:3001/api/review-callbacks \
  -H "Authorization: Bearer csan_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outputId": "OUTPUT_ID",
    "status": "approved",
    "externalJobId": "n8n-exec-456",
    "reviewerIdentifier": "boss@company.com",
    "notes": "Approved. Ready to publish."
  }'
```

### 7. Check result in CaptionSan / Cek hasil di CaptionSan

Open **Dashboard → Review** to see the callback event and updated status.
Buka **Dashboard → Review** untuk melihat event callback dan status yang diperbarui.

---

## Troubleshooting / Pemecahan Masalah

| Problem / Masalah | Cause / Penyebab | Solution / Solusi |
|---------|--------|----------|
| `401 Unauthorized` | Invalid or expired token / Token tidak valid atau kedaluwarsa | Create a new token in Settings / Buat token baru di Pengaturan |
| `404 Output not found` | Wrong outputId / outputId salah | Check the correct UUID from project detail / Cek UUID yang benar dari detail proyek |
| `409 Invalid transition` | Output not in correct state / Output tidak dalam status yang benar | Submit for review first (`in_review`) / Submit untuk review dulu (`in_review`) |
| `400 status is required` | Missing required field / Field wajib tidak ada | Include both `outputId` and `status` in body / Sertakan `outputId` dan `status` di body |
| Duplicate response | Same callback sent twice / Callback yang sama dikirim dua kali | This is safe — CaptionSan handles it idempotently / Ini aman — CaptionSan menanganinya secara idempotent |

---

## Security Notes / Catatan Keamanan

- Always use HTTPS in production. / Selalu gunakan HTTPS di production.
- Keep your API token secret. Rotate it if compromised. / Jaga kerahasiaan API token. Rotasi jika bocor.
- Tokens can be deleted from Settings to revoke access immediately. / Token bisa dihapus dari Pengaturan untuk mencabut akses segera.
- All callbacks are recorded in audit history regardless of success or failure. / Semua callback dicatat di riwayat audit terlepas dari berhasil atau gagal.

---

## n8n Template (Copy-Paste Ready)

Here's a minimal n8n HTTP Request node configuration:
Berikut konfigurasi minimal node HTTP Request n8n:

```json
{
  "method": "POST",
  "url": "http://YOUR_API_HOST:3001/api/review-callbacks",
  "headers": {
    "Authorization": "Bearer csan_YOUR_TOKEN",
    "Content-Type": "application/json"
  },
  "body": {
    "outputId": "={{ $json.outputId }}",
    "status": "={{ $json.decision }}",
    "externalJobId": "={{ $execution.id }}",
    "reviewerIdentifier": "={{ $json.reviewer }}",
    "notes": "={{ $json.notes }}"
  }
}
```

Replace `YOUR_API_HOST` and `YOUR_TOKEN` with your actual values.
Ganti `YOUR_API_HOST` dan `YOUR_TOKEN` dengan nilai Anda yang sebenarnya.
