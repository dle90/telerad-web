/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Cross-origin: the SPA calls telerad-core directly at
  // window.__TELERAD_CORE_URL__ (public/config.js in dev) — no dev proxy.
  // telerad-core must allow CORS for this origin + the Authorization header
  // (set on telerad-core via CORS_ALLOWED_ORIGINS / CORS_ALLOW_HEADERS env).
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Vitest (unit) config — jsdom, no dev server.
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
})
