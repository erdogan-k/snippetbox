import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Dynamically configure base path for GitHub Pages deployment
// Defaults to './' so it works both at root and on any repository subpath (/repo-name/),
// and also respects VITE_BASE_PATH if explicitly set in CI/CD.
const basePath = process.env.VITE_BASE_PATH || './';

export default defineConfig({
  base: basePath,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
