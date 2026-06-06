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
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler'))
            return 'react';
          if (id.includes('motion') || id.includes('framer')) return 'motion';
          if (id.includes('@tanstack')) return 'query';
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
