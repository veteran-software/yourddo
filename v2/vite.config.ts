/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'node'
  },
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['color-functions', 'global-builtin', 'import', 'if-function']
      }
    }
  },
  plugins: [react()],
  server: {
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
