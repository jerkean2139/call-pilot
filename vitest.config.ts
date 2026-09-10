import { defineConfig } from 'vitest/config';
import path from 'path';

// Deliberately separate from vite.config.ts: the CRXJS plugin expects to build a
// real extension and has no place in a unit test run.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
