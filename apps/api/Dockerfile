FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY packages/db ./packages/db
COPY apps/api ./apps/api
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Run
FROM base AS runner
WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3001
COPY --from=builder /app/apps/api/entrypoint.sh ./apps/api/entrypoint.sh
RUN chmod +x ./apps/api/entrypoint.sh
CMD ["./apps/api/entrypoint.sh"]
