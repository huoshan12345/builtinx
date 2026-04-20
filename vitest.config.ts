import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['test/setupFiles.ts'],
    globals: true,
    env: {
      NODE_ENV: 'test',
    },
  },
  plugins: [
  ],
});