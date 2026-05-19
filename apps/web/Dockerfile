FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY packages/db ./packages/db
COPY apps/web ./apps/web
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

ENV NEXT_PUBLIC_API_URL=http://localhost:3001
RUN pnpm --filter @captionsan/web build

# Run
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json

EXPOSE 3000
CMD ["pnpm", "--filter", "@captionsan/web", "start"]
