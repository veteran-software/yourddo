import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import']
      }
    }
  },
  plugins: [react()],
  server: {
    fs: {
      strict: true
    },
    proxy: {
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
