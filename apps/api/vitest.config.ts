import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@captionsan/db': new URL('../../packages/db/src', import.meta.url).pathname,
      '@captionsan/db/schema': new URL('../../packages/db/src/schema', import.meta.url).pathname,
    },
  },
});
