import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load correctly on GitHub Pages under any path
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
