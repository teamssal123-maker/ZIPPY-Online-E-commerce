import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  base: '/admin/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, '../dist/admin'),
    emptyOutDir: true
  },
  server: {
    host: '0.0.0.0',
    port: 3002,
    allowedHosts: ['.monkeycode-ai.live'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
