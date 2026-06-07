/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/stardust/',
  build: {
    rollupOptions: {
      output: {
        // Split big, rarely-changing vendor libraries into their own chunks so
        // an app-code change doesn't bust the whole cached bundle.
        manualChunks(id) {
          // Normalize Windows backslashes so the path checks match on every OS.
          const path = id.replace(/\\/g, '/');
          if (!path.includes('node_modules')) return;
          if (path.includes('react-dom') || path.includes('/react/') || path.includes('scheduler'))
            return 'react';
          if (path.includes('motion') || path.includes('framer')) return 'motion';
          if (path.includes('@tanstack')) return 'query';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
});
