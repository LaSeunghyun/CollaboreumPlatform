import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    manifest: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
