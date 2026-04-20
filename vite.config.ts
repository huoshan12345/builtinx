import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'builtinx',
      formats: ['es', 'cjs']
    }
  }
});