import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  css: {
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
  plugins: [react()]
})
