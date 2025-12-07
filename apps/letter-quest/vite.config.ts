import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@games/shared': resolve(__dirname, '../../packages/shared/src/index.ts')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});

