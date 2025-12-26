import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Read .env file from the root directory
  envDir: path.resolve(__dirname, '..'),
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    // Suppress React act warnings in tests
    onConsoleLog: (log, type) => {
      if (type === 'warn' && (log.includes('act') || log.includes('An update to'))) {
        return false;
      }
    },
  },
});
