import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
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
    proxy: {
      '/api': {
        target: 'https://gls.ddo.com/',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, 'GLS.DataCenterServer/Service.asmx?op=GetDatacenterStatus')
      }
    }
  },
  build: {
    modulePreload: true
  }
})
