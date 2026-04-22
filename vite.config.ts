import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
  ],
  build: {
    lib: {
      name: 'builtinx',
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es']
    },
  }
});