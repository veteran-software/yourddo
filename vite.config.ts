import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import']
      }
    }
  },
  plugins: [react()],
  server: {
    proxy:
      mode === 'development'
        ? {
            '/api': {
              target: 'https://gls.ddo.com/',
              changeOrigin: true,
              rewrite: (path: string) => path.replace(/^\/api/, 'GLS.DataCenterServer/StatusServer.aspx')
            }
          }
        : undefined
  }
}))
