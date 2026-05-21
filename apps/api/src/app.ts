import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth.js';
import { healthRoutes } from './routes/health.js';
import { invitationRoutes } from './routes/invitations.js';
import { providerRoutes } from './routes/providers.js';
import { projectRoutes } from './routes/projects.js';
import { generationRoutes } from './routes/generations.js';
import { revisionRoutes } from './routes/revisions.js';
import { promptRoutes } from './routes/prompts.js';
import { apiTokenRoutes } from './routes/api-tokens.js';
import { brandVoiceRoutes } from './routes/brand-voices.js';
import { promptTemplateRoutes } from './routes/prompt-templates.js';
import { versionHistoryRoutes } from './routes/version-history.js';
import { operationsRoutes } from './routes/operations.js';
import { reviewCallbackRoutes } from './routes/review-callbacks.js';
import { v1Routes } from './routes/v1/index.js';
import { setupRoutes } from './scripts/setup.js';

export const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Routes
app.route('/health', healthRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/invitations', invitationRoutes);
app.route('/api/providers', providerRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/generations', generationRoutes);
app.route('/api/outputs', revisionRoutes);
app.route('/api/projects', promptRoutes);
app.route('/api/tokens', apiTokenRoutes);
app.route('/api/brand-voices', brandVoiceRoutes);
app.route('/api/prompt-templates', promptTemplateRoutes);
app.route('/api/history', versionHistoryRoutes);
app.route('/api/operations', operationsRoutes);
app.route('/api/review-callbacks', reviewCallbackRoutes);
app.route('/api/setup', setupRoutes);

// Stable external API (v1)
app.route('/v1', v1Routes);
