/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'node'
  },
  plugins: [react()],
  server: {
    // Editors can truncate a module briefly while saving it.
    watch: { awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 25 } },
    fs: {
      strict: true
    },
    proxy: {
      '/data-cdn': {
        target: 'https://cdn.yourddo.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/data-cdn/, '')
      },
      '/api/dc': {
        target: 'https://gls.ddo.com/',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api\/dc/, 'GLS.DataCenterServer/Datacenters.xml')
      },
      '/api-lam/dc': {
        target: 'https://gls-lm.ddo.com/',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api-lam\/dc/, 'GLS.DataCenterServer/Datacenters.xml')
      },
      '/api-lam': {
        target: 'https://gls-lm.ddo.com/',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api-lam/, 'GLS.DataCenterServer/StatusServer.aspx')
      },
      '/api/status': {
        target: 'https://gls.ddo.com/',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, 'GLS.DataCenterServer/StatusServer.aspx')
      }
    }
  },
  build: {
    modulePreload: true
  }
})
