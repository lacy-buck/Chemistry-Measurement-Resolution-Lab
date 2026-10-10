import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  // Support GitHub Pages repository subdirectories dynamically via GITHUB_REPOSITORY
  // e.g. "owner/my-repo" -> base = "/my-repo/"
  // In local development or custom domains, fallback to root "/" or relative base "./"
  const repoName = process.env.GITHUB_REPOSITORY
    ? process.env.GITHUB_REPOSITORY.split('/')[1]
    : '';
  const base = repoName ? `/${repoName}/` : './';

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
