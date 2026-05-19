#!/bin/sh
set -e

echo "⏳ Pushing database schema..."
cd /app/packages/db
pnpm push 2>&1 || echo "⚠️  Schema push failed (may already be applied)"

echo "🚀 Starting API server..."
cd /app
exec pnpm --filter @captionsan/api dev
