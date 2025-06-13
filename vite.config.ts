import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: [
          'mixed-decls',
          'color-functions',
          'global-builtin',
          'import'
        ]
      }
    }
  },
  plugins: [
    react(),
    compression({
      ext: '.br',
      algorithm: 'brotliCompress',
      deleteOriginFile: true,
      filter: /\.(js|css|json|html|svg|png)$/
    })
  ]
})
