import { Hono } from 'hono';
import { requireApiAuth } from '../../middleware/api-key.js';
import { v1Projects } from './projects.js';
import { v1Generations } from './generations.js';
import { v1Outputs } from './outputs.js';

export const v1Routes = new Hono();

// All v1 routes require API key or session auth
v1Routes.use('*', requireApiAuth);

v1Routes.route('/projects', v1Projects);
v1Routes.route('/generations', v1Generations);
v1Routes.route('/outputs', v1Outputs);
