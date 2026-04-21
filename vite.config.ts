import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      entryRoot: 'src',
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      name: 'builtinx',
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es']
    }
  }
});
