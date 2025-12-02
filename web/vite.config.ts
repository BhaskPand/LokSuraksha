import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  resolve: {
    alias: {
      '@citizen-safety/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  optimizeDeps: {
    include: ['@citizen-safety/shared'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
});

