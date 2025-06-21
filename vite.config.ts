import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression'

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
  plugins: [
    react(),
    compression({
      ext: '.br',
      algorithm: 'brotliCompress',
      deleteOriginFile: false,
      filter: /\.(js|css|json|html|svg|png)$/
    })
  ],
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
