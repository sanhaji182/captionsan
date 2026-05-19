# CaptionSan API Documentation

## Base URL

```
http://localhost:3001
```

## Authentication

All `/v1/*` endpoints accept two authentication methods:

### 1. API Token (recommended for pipelines)

```
Authorization: Bearer csan_<your-token>
```

Create tokens via the Settings page or `POST /api/tokens`.

### 2. Session Cookie (browser)

Automatically handled by Better Auth when using the web app.

---

## Endpoints

### Projects

#### List Projects

```
GET /v1/projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "title": "string",
      "sourceType": "idea | draft",
      "sourceLanguage": "id | en",
      "status": "draft | generating | review | approved",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

#### Get Project (with outputs and history)

```
GET /v1/projects/:id
```

**Response:**
```json
{
  "project": { ... },
  "generations": [ ... ],
  "outputs": [
    {
      "id": "uuid",
      "platform": "instagram_feed | instagram_story | threads | whatsapp_status | linkedin | website",
      "tone": "string",
      "characterCount": 123,
      "contentOriginalAi": "string",
      "contentCurrent": "string",
      "approvalStatus": "draft | approved",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "revisions": [
    {
      "id": "uuid",
      "platformOutputId": "uuid",
      "actorType": "ai | user",
      "instructionText": "string",
      "resultingContent": "string",
      "createdAt": "timestamp"
    }
  ]
}
```

#### Create Project

```
POST /v1/projects
```

**Body:**
```json
{
  "title": "string (required)",
  "sourceType": "idea | draft (required)",
  "originalInput": "string (required)",
  "additionalContext": "string (optional)",
  "sourceLanguage": "id | en (optional, default: id)"
}
```

---

### Generations

#### Generate Content

```
POST /v1/generations
```

**Body:**
```json
{
  "projectId": "uuid (required)",
  "platforms": ["instagram_feed", "threads", "linkedin"],
  "providerConnectionId": "uuid (optional, uses default)"
}
```

If `platforms` is omitted, all 6 platforms are generated.

**Response:**
```json
{
  "generation": {
    "id": "uuid",
    "status": "completed | partial | failed",
    "outputs": [
      {
        "id": "uuid",
        "platform": "string",
        "characterCount": 123,
        "content": "string",
        "approvalStatus": "draft"
      }
    ],
    "errors": [{ "platform": "string", "error": "string" }]
  }
}
```

#### Get Generation

```
GET /v1/generations/:id
```

---

### Outputs

#### Revise Output (AI)

```
POST /v1/outputs/:id/revise
```

**Body:**
```json
{
  "instruction": "string (required) - free-text revision instruction"
}
```

**Response:**
```json
{
  "output": {
    "id": "uuid",
    "platform": "string",
    "content": "string (revised)",
    "characterCount": 123,
    "approvalStatus": "draft"
  }
}
```

#### Edit Output (Manual)

```
PUT /v1/outputs/:id
```

**Body:**
```json
{
  "content": "string (required)"
}
```

#### Approve Output

```
POST /v1/outputs/:id/approve
```

**Response:**
```json
{
  "output": { "id": "uuid", "approvalStatus": "approved" },
  "allApproved": true
}
```

#### Get Revision History

```
GET /v1/outputs/:id/history
```

---

### Platforms

Supported platform values:
- `instagram_feed`
- `instagram_story`
- `threads`
- `whatsapp_status`
- `linkedin`
- `website`

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

HTTP status codes:
- `400` — Bad request (missing/invalid params)
- `401` — Unauthorized
- `404` — Not found
- `422` — Unprocessable (e.g., provider connection test failed)
- `500` — Server error

---

## Example: Full Pipeline Flow

```bash
# 1. Create a project
curl -X POST http://localhost:3001/v1/projects \
  -H "Authorization: Bearer csan_your_token" \
  -H "Content-Type: application/json" \
  -d '{"title":"Promo Akhir Tahun","sourceType":"idea","originalInput":"Diskon 50% semua produk sampai 31 Desember"}'

# 2. Generate content for specific platforms
curl -X POST http://localhost:3001/v1/generations \
  -H "Authorization: Bearer csan_your_token" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"<project-id>","platforms":["instagram_feed","threads","linkedin"]}'

# 3. Revise an output
curl -X POST http://localhost:3001/v1/outputs/<output-id>/revise \
  -H "Authorization: Bearer csan_your_token" \
  -H "Content-Type: application/json" \
  -d '{"instruction":"Buat lebih singkat dan tambahkan emoji"}'

# 4. Approve
curl -X POST http://localhost:3001/v1/outputs/<output-id>/approve \
  -H "Authorization: Bearer csan_your_token"
```
