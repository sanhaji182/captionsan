# CaptionSan

Bilingual invite-only SaaS for AI-assisted content writing. Write one idea, generate content for 6 platforms.

## Quick Start (Docker)

```bash
# Start everything (PostgreSQL + API + Web)
docker compose up --build

# Wait for services to start, then create the admin user:
curl -X POST http://localhost:3001/api/setup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@captionsan.local","password":"admin123"}'
```

Then open **http://localhost:3000** and login with:
- Email: `admin@captionsan.local`
- Password: `admin123`

### Test Invitation Flow

After setup, a test invite is created. Open:
```
http://localhost:3000/invite/test-invite-token
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Web | http://localhost:3000 | Next.js frontend |
| API | http://localhost:3001 | Hono backend |
| DB | localhost:5432 | PostgreSQL |

## Using AI Generation

1. Go to **Pengaturan** (Settings)
2. Add your OpenAI-compatible provider:
   - Provider Name: `OpenAI`
   - Base URL: `https://api.openai.com/v1`
   - Model: `gpt-4o-mini`
   - API Key: your key
3. Create a project from the dashboard
4. Select platforms and generate

## Local Development (without Docker)

```bash
# Install dependencies
pnpm install

# Set up env
cp .env.example .env
# Edit .env with your DATABASE_URL

# Push schema to database
pnpm db:push

# Start API
pnpm --filter @captionsan/api dev

# Start Web (separate terminal)
pnpm --filter @captionsan/web dev
```

## API Documentation

See [docs/API.md](docs/API.md) for the full external API reference.

## Stack

- Frontend: Next.js 15 + Tailwind CSS 4
- Backend: Hono
- Database: PostgreSQL + Drizzle ORM
- Auth: Better Auth
- AI: Provider-agnostic (OpenAI-compatible)
